import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { isAdmin, isManager, requireManagerOrAdmin } from '../middleware/rbac.js';
import { uploadProof } from '../middleware/upload.js';
import { reviewSchema } from '../validators/schemas.js';
import { badRequest, forbidden, notFound } from '../utils/httpError.js';
import { logActivity } from '../services/activityService.js';
import { notify } from '../services/notificationService.js';
import { awardPointsForApproval } from '../services/pointsService.js';
import { issuePenalty } from '../services/faultService.js';
import { getSetting } from '../services/settingsService.js';

const router = Router();
router.use(requireAuth);

router.get('/me', async (req, res, next) => {
  try {
    const assignments = await prisma.taskAssignment.findMany({
      where: { userId: req.user.id },
      include: {
        task: {
          include: { team: { select: { id: true, code: true, name: true, color: true } } },
        },
      },
      orderBy: [{ task: { dueAt: 'asc' } }],
    });
    res.json({ assignments });
  } catch (err) {
    next(err);
  }
});

router.get('/team/:teamId/review', requireManagerOrAdmin, async (req, res, next) => {
  try {
    if (isManager(req.user) && req.user.teamId !== req.params.teamId) throw forbidden();
    const assignments = await prisma.taskAssignment.findMany({
      where: {
        status: 'SUBMITTED',
        user: { teamId: req.params.teamId },
      },
      include: {
        task: true,
        user: { select: { id: true, name: true, avatarUrl: true, teamId: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });
    res.json({ assignments });
  } catch (err) {
    next(err);
  }
});

router.get('/review/all', requireManagerOrAdmin, async (req, res, next) => {
  try {
    const where = { status: 'SUBMITTED' };
    if (isManager(req.user)) {
      where.user = { teamId: req.user.teamId };
    }
    const assignments = await prisma.taskAssignment.findMany({
      where,
      include: {
        task: true,
        user: { select: { id: true, name: true, avatarUrl: true, teamId: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });
    res.json({ assignments });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const a = await prisma.taskAssignment.findUnique({
      where: { id: req.params.id },
      include: {
        task: { include: { team: true } },
        user: { select: { id: true, name: true, avatarUrl: true, teamId: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });
    if (!a) throw notFound();

    const allowed =
      isAdmin(req.user) ||
      a.userId === req.user.id ||
      (isManager(req.user) && a.user.teamId === req.user.teamId);
    if (!allowed) throw forbidden();
    res.json({ assignment: a });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/start', async (req, res, next) => {
  try {
    const a = await prisma.taskAssignment.findUnique({ where: { id: req.params.id } });
    if (!a) throw notFound();
    if (a.userId !== req.user.id) throw forbidden();
    if (!['ASSIGNED', 'IN_PROGRESS'].includes(a.status)) throw badRequest('Cannot start');

    const updated = await prisma.taskAssignment.update({
      where: { id: a.id },
      data: { status: 'IN_PROGRESS', startedAt: a.startedAt || new Date() },
    });
    await logActivity({
      actorId: req.user.id,
      type: 'TASK_STARTED',
      entityType: 'TaskAssignment',
      entityId: a.id,
    });
    res.json({ assignment: updated });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/submit', (req, res, next) => {
  uploadProof(req, res, async (uploadErr) => {
    try {
      if (uploadErr) return next(uploadErr);
      const a = await prisma.taskAssignment.findUnique({
        where: { id: req.params.id },
        include: { task: true },
      });
      if (!a) throw notFound();
      if (a.userId !== req.user.id) throw forbidden();
      if (!['ASSIGNED', 'IN_PROGRESS', 'REJECTED'].includes(a.status)) {
        throw badRequest('Cannot submit in current state');
      }

      const file = req.file;
      if (a.task.proofRequired && !file) throw badRequest('Proof file required');

      const isLate = new Date() > a.task.dueAt;

      const updated = await prisma.taskAssignment.update({
        where: { id: a.id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          proofUrl: file ? `/uploads/${file.filename}` : a.proofUrl,
          proofMime: file ? file.mimetype : a.proofMime,
          proofOriginalName: file ? file.originalname : a.proofOriginalName,
        },
      });

      await logActivity({
        actorId: req.user.id,
        type: 'TASK_SUBMITTED',
        entityType: 'TaskAssignment',
        entityId: a.id,
        metadata: { taskTitle: a.task.title, late: isLate },
      });

      if (isLate) {
        const latePoints = await getSetting('late_penalty_points');
        await issuePenalty({
          userId: req.user.id,
          type: 'LATE',
          points: latePoints,
          reason: `Late submission: ${a.task.title}`,
          taskAssignmentId: a.id,
          issuedById: null,
        });
      }

      res.json({ assignment: updated });
    } catch (err) {
      next(err);
    }
  });
});

router.post('/:id/review', requireManagerOrAdmin, async (req, res, next) => {
  try {
    const { decision, note } = reviewSchema.parse(req.body);
    const a = await prisma.taskAssignment.findUnique({
      where: { id: req.params.id },
      include: { user: true, task: true },
    });
    if (!a) throw notFound();
    if (isManager(req.user) && a.user.teamId !== req.user.teamId) throw forbidden();
    if (a.status !== 'SUBMITTED') throw badRequest('Only submitted assignments can be reviewed');

    const updated = await prisma.taskAssignment.update({
      where: { id: a.id },
      data: {
        status: decision,
        reviewedAt: new Date(),
        reviewedById: req.user.id,
        reviewNote: note || null,
      },
    });

    await logActivity({
      actorId: req.user.id,
      type: 'TASK_REVIEWED',
      entityType: 'TaskAssignment',
      entityId: a.id,
      metadata: { decision, taskTitle: a.task.title, userId: a.userId },
    });

    if (decision === 'APPROVED') {
      await awardPointsForApproval(a.id, req.user.id);
      await notify(a.userId, {
        type: 'TASK_APPROVED',
        title: 'Task approved',
        body: a.task.title,
        link: `/tasks/${a.taskId}`,
      });
    } else {
      await notify(a.userId, {
        type: 'TASK_REJECTED',
        title: 'Task rejected — please resubmit',
        body: note || a.task.title,
        link: `/tasks/${a.taskId}`,
      });
    }

    res.json({ assignment: updated });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/proof', async (req, res, next) => {
  try {
    const a = await prisma.taskAssignment.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!a || !a.proofUrl) throw notFound();
    const allowed =
      isAdmin(req.user) ||
      a.userId === req.user.id ||
      (isManager(req.user) && a.user.teamId === req.user.teamId);
    if (!allowed) throw forbidden();

    const filename = path.basename(a.proofUrl);
    const filePath = path.join(path.resolve(process.env.UPLOAD_DIR || './uploads'), filename);
    if (!fs.existsSync(filePath)) throw notFound();
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

export default router;
