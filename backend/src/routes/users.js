import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin, isAdmin } from '../middleware/rbac.js';
import { userCreateSchema, userUpdateSchema } from '../validators/schemas.js';
import { hashPassword } from '../utils/hash.js';
import { forbidden, notFound } from '../utils/httpError.js';
import { logActivity } from '../services/activityService.js';

const router = Router();
router.use(requireAuth);

const SAFE = {
  id: true,
  email: true,
  name: true,
  role: true,
  teamId: true,
  team: { select: { id: true, code: true, name: true, color: true } },
  avatarUrl: true,
  points: true,
  faultCount: true,
  warningLevel: true,
  isActive: true,
  createdAt: true,
};

router.get('/', async (req, res, next) => {
  try {
    if (!isAdmin(req.user) && req.user.role !== 'TEAM_MANAGER') throw forbidden();
    const where = {};
    if (!isAdmin(req.user)) where.teamId = req.user.teamId;
    if (req.query.teamId) where.teamId = String(req.query.teamId);
    if (req.query.role) where.role = String(req.query.role);
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: SAFE,
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isAdmin(req.user) && req.user.id !== id) {
      // managers can read own team
      if (req.user.role === 'TEAM_MANAGER') {
        const target = await prisma.user.findUnique({ where: { id } });
        if (!target || target.teamId !== req.user.teamId) throw forbidden();
      } else {
        throw forbidden();
      }
    }
    const user = await prisma.user.findUnique({ where: { id }, select: SAFE });
    if (!user) throw notFound();
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const body = userCreateSchema.parse(req.body);
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        name: body.name,
        passwordHash,
        role: body.role,
        teamId: body.teamId || null,
        avatarUrl: body.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(body.name)}`,
      },
      select: SAFE,
    });
    await logActivity({
      actorId: req.user.id,
      type: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      metadata: { name: user.name, role: user.role },
    });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const body = userUpdateSchema.parse(req.body);
    const data = { ...body };
    if (body.password) {
      data.passwordHash = await hashPassword(body.password);
      delete data.password;
    }
    if (body.email) data.email = body.email.toLowerCase();
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: SAFE,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/:id/points-history', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isAdmin(req.user) && req.user.id !== id) {
      if (req.user.role !== 'TEAM_MANAGER') throw forbidden();
      const target = await prisma.user.findUnique({ where: { id } });
      if (!target || target.teamId !== req.user.teamId) throw forbidden();
    }

    const [approvals, penalties] = await Promise.all([
      prisma.taskAssignment.findMany({
        where: { userId: id, status: 'APPROVED' },
        include: { task: { select: { title: true, type: true } } },
        orderBy: { reviewedAt: 'desc' },
        take: 50,
      }),
      prisma.penalty.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const events = [
      ...approvals.map((a) => ({
        kind: 'AWARD',
        points: a.awardedPoints || 0,
        title: a.task.title,
        meta: a.task.type,
        at: a.reviewedAt || a.updatedAt,
      })),
      ...penalties.map((p) => ({
        kind: 'PENALTY',
        points: p.points,
        title: p.reason,
        meta: p.type,
        at: p.createdAt,
      })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at));

    res.json({ events });
  } catch (err) {
    next(err);
  }
});

export default router;
