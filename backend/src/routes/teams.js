import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { teamCreateSchema, teamUpdateSchema } from '../validators/schemas.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: {
        manager: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });
    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        manager: { select: { id: true, name: true, avatarUrl: true, email: true } },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            points: true,
            faultCount: true,
          },
          orderBy: { points: 'desc' },
        },
      },
    });
    res.json({ team });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const body = teamCreateSchema.parse(req.body);
    const team = await prisma.team.create({ data: body });
    res.status(201).json({ team });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const body = teamUpdateSchema.parse(req.body);
    const team = await prisma.team.update({ where: { id: req.params.id }, data: body });
    res.json({ team });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/manager', requireAdmin, async (req, res, next) => {
  try {
    const { userId } = req.body;
    const team = await prisma.team.update({
      where: { id: req.params.id },
      data: { managerId: userId },
    });
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'TEAM_MANAGER', teamId: team.id },
      });
    }
    res.json({ team });
  } catch (err) {
    next(err);
  }
});

export default router;
