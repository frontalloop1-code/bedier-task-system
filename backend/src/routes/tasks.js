import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import {
  buildTaskVisibilityFilter,
  isAdmin,
  isManager,
  requireManagerOrAdmin,
} from '../middleware/rbac.js';
import { taskCreateSchema, taskUpdateSchema } from '../validators/schemas.js';
import { forbidden, notFound, badRequest } from '../utils/httpError.js';
import { logActivity } from '../services/activityService.js';
import { notifyMany } from '../services/notificationService.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const where = { AND: [buildTaskVisibilityFilter(req.user)] };
    if (req.query.status) where.AND.push({ status: req.query.status });
    if (req.query.type) where.AND.push({ type: req.query.type });
    if (req.query.teamId) where.AND.push({ teamId: req.query.teamId });
    if (req.query.mine === 'true') {
      where.AND.push({ assignments: { some: { userId: req.user.id } } });
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ dueAt: 'asc' }],
      include: {
        team: { select: { id: true, code: true, name: true, color: true } },
        createdBy: { select: { id: true, name: true } },
        assignments: {
          select: {
            id: true,
            userId: true,
            status: true,
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        team: true,
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        assignments: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, teamId: true } },
            reviewedBy: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!task) throw notFound();

    if (!isAdmin(req.user)) {
      const visibleToManager =
        isManager(req.user) &&
        (task.type === 'GENERAL' ||
          task.teamId === req.user.teamId ||
          task.assignments.some((a) => a.userId === req.user.id));

      const visibleToEmployee =
        task.type === 'GENERAL' ||
        (task.type === 'TEAM' && task.teamId === req.user.teamId) ||
        task.assignments.some((a) => a.userId === req.user.id);

      if (!visibleToManager && !visibleToEmployee) throw forbidden();
    }
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireManagerOrAdmin, async (req, res, next) => {
  try {
    const body = taskCreateSchema.parse(req.body);

    if (body.type === 'TEAM' && !body.teamId) throw badRequest('teamId required for TEAM tasks');
    if (body.type === 'PRIVATE' && (!body.assigneeIds || body.assigneeIds.length !== 1)) {
      throw badRequest('PRIVATE tasks require exactly one assignee');
    }

    if (isManager(req.user)) {
      if (body.type === 'GENERAL') throw forbidden('Only admins create GENERAL tasks');
      if (body.type === 'TEAM' && body.teamId !== req.user.teamId) {
        throw forbidden('Manager can only create tasks for their own team');
      }
      if (body.type === 'PRIVATE') {
        const target = await prisma.user.findUnique({ where: { id: body.assigneeIds[0] } });
        if (!target || target.teamId !== req.user.teamId) throw forbidden();
      }
    }

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        type: body.type,
        teamId: body.teamId || null,
        dueAt: new Date(body.dueAt),
        points: body.points,
        proofRequired: body.proofRequired,
        createdById: req.user.id,
        status: 'ASSIGNED',
      },
    });

    let assigneeIds = body.assigneeIds || [];
    if (body.type === 'GENERAL') {
      assigneeIds = (
        await prisma.user.findMany({ where: { isActive: true }, select: { id: true } })
      ).map((u) => u.id);
    } else if (body.type === 'TEAM') {
      assigneeIds = (
        await prisma.user.findMany({
          where: { isActive: true, teamId: body.teamId },
          select: { id: true },
        })
      ).map((u) => u.id);
    }

    if (assigneeIds.length) {
      await prisma.taskAssignment.createMany({
        data: assigneeIds.map((userId) => ({ taskId: task.id, userId })),
        skipDuplicates: true,
      });
      await notifyMany(assigneeIds, {
        type: 'TASK_ASSIGNED',
        title: 'New task assigned',
        body: task.title,
        link: `/tasks/${task.id}`,
      });
    }

    await logActivity({
      actorId: req.user.id,
      type: 'TASK_CREATED',
      entityType: 'Task',
      entityId: task.id,
      metadata: { title: task.title, type: task.type, assignees: assigneeIds.length },
    });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireManagerOrAdmin, async (req, res, next) => {
  try {
    const body = taskUpdateSchema.parse(req.body);
    const data = { ...body };
    if (body.dueAt) data.dueAt = new Date(body.dueAt);
    delete data.assigneeIds;

    const task = await prisma.task.update({ where: { id: req.params.id }, data });
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireManagerOrAdmin, async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post('/:id/assign', requireManagerOrAdmin, async (req, res, next) => {
  try {
    const userIds = Array.isArray(req.body.userIds) ? req.body.userIds : [];
    if (!userIds.length) throw badRequest('userIds required');
    await prisma.taskAssignment.createMany({
      data: userIds.map((userId) => ({ taskId: req.params.id, userId })),
      skipDuplicates: true,
    });
    await notifyMany(userIds, {
      type: 'TASK_ASSIGNED',
      title: 'New task assigned',
      link: `/tasks/${req.params.id}`,
    });
    res.json({ ok: true, count: userIds.length });
  } catch (err) {
    next(err);
  }
});

export default router;
