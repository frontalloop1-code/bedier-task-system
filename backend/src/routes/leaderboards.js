import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/employees', async (req, res, next) => {
  try {
    const where = { isActive: true, role: 'EMPLOYEE' };
    if (req.query.teamId) where.teamId = String(req.query.teamId);

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        points: true,
        faultCount: true,
        team: { select: { id: true, code: true, name: true, color: true } },
      },
      orderBy: [{ points: 'desc' }, { faultCount: 'asc' }],
      take: Number(req.query.limit || 50),
    });

    const ranked = users.map((u, i) => ({ ...u, rank: i + 1 }));
    res.json({ employees: ranked });
  } catch (err) {
    next(err);
  }
});

router.get('/teams', async (_req, res, next) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: { select: { points: true, faultCount: true } },
        _count: { select: { tasks: true } },
      },
    });

    const result = teams.map((t) => {
      const totalPoints = t.members.reduce((s, m) => s + m.points, 0);
      const totalFaults = t.members.reduce((s, m) => s + m.faultCount, 0);
      return {
        id: t.id,
        code: t.code,
        name: t.name,
        color: t.color,
        memberCount: t.members.length,
        totalPoints,
        totalFaults,
        avgPoints: t.members.length ? Math.round(totalPoints / t.members.length) : 0,
        taskCount: t._count.tasks,
      };
    });
    result.sort((a, b) => b.totalPoints - a.totalPoints);
    result.forEach((t, i) => (t.rank = i + 1));
    res.json({ teams: result });
  } catch (err) {
    next(err);
  }
});

router.get('/global', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
        points: true,
        faultCount: true,
        team: { select: { id: true, code: true, name: true, color: true } },
      },
      orderBy: [{ points: 'desc' }],
      take: 100,
    });
    res.json({ users: users.map((u, i) => ({ ...u, rank: i + 1 })) });
  } catch (err) {
    next(err);
  }
});

export default router;
