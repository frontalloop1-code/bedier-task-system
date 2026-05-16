import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { getSetting } from '../services/settingsService.js';

const router = Router();
router.use(requireAuth);

router.get('/admin', requireAdmin, async (_req, res, next) => {
  try {
    const [
      totalTasks,
      completedTasks,
      lateTasks,
      activeEmployees,
      totalPenalties,
      submittedReview,
    ] = await Promise.all([
      prisma.task.count(),
      prisma.taskAssignment.count({ where: { status: 'APPROVED' } }),
      prisma.taskAssignment.count({ where: { status: 'MISSED' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.penalty.count(),
      prisma.taskAssignment.count({ where: { status: 'SUBMITTED' } }),
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentApprovals = await prisma.taskAssignment.findMany({
      where: { status: 'APPROVED', reviewedAt: { gte: sevenDaysAgo } },
      select: { reviewedAt: true },
    });
    const trend = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const count = recentApprovals.filter(
        (a) => a.reviewedAt >= d && a.reviewedAt < next,
      ).length;
      return {
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toISOString().slice(0, 10),
        count,
      };
    });

    const teams = await prisma.team.findMany({
      include: {
        members: { select: { points: true } },
        tasks: {
          select: {
            assignments: { select: { status: true } },
          },
        },
      },
    });
    const teamCompare = teams.map((t) => {
      const total = t.tasks.reduce((s, x) => s + x.assignments.length, 0);
      const done = t.tasks.reduce(
        (s, x) => s + x.assignments.filter((a) => a.status === 'APPROVED').length,
        0,
      );
      return {
        id: t.id,
        code: t.code,
        name: t.name,
        color: t.color,
        completion: total ? Math.round((done / total) * 100) : 0,
        points: t.members.reduce((s, m) => s + m.points, 0),
      };
    });

    const activity = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
    });

    const topEmployees = await prisma.user.findMany({
      where: { isActive: true, role: 'EMPLOYEE' },
      orderBy: { points: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        points: true,
        team: { select: { name: true, color: true } },
      },
    });

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        lateTasks,
        activeEmployees,
        totalPenalties,
        submittedReview,
      },
      trend,
      teamCompare,
      activity,
      topEmployees,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date(now);
    endToday.setHours(23, 59, 59, 999);
    const inSeven = new Date(now);
    inSeven.setDate(now.getDate() + 7);

    const [dueToday, upcoming, late, all] = await Promise.all([
      prisma.taskAssignment.findMany({
        where: {
          userId,
          status: { notIn: ['APPROVED', 'MISSED'] },
          task: { dueAt: { gte: startToday, lte: endToday } },
        },
        include: { task: { include: { team: true } } },
        orderBy: { task: { dueAt: 'asc' } },
      }),
      prisma.taskAssignment.findMany({
        where: {
          userId,
          status: { notIn: ['APPROVED', 'MISSED'] },
          task: { dueAt: { gt: endToday, lte: inSeven } },
        },
        include: { task: { include: { team: true } } },
        orderBy: { task: { dueAt: 'asc' } },
      }),
      prisma.taskAssignment.findMany({
        where: {
          userId,
          status: { notIn: ['APPROVED', 'MISSED'] },
          task: { dueAt: { lt: startToday } },
        },
        include: { task: { include: { team: true } } },
      }),
      prisma.taskAssignment.findMany({
        where: { userId },
        include: { task: true },
      }),
    ]);

    const completed = all.filter((a) => a.status === 'APPROVED').length;
    const pending = all.filter((a) =>
      ['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'REJECTED'].includes(a.status),
    ).length;
    const missed = all.filter((a) => a.status === 'MISSED').length;
    const completionRate = all.length ? Math.round((completed / all.length) * 100) : 0;

    const ranked = await prisma.user.findMany({
      where: { isActive: true, role: 'EMPLOYEE' },
      orderBy: [{ points: 'desc' }],
      select: { id: true },
    });
    const rank = ranked.findIndex((u) => u.id === userId) + 1 || null;

    const notifs = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const maxFaults = await getSetting('max_fault_points');

    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        points: req.user.points,
        faultCount: req.user.faultCount,
        warningLevel: req.user.warningLevel,
        maxFaults,
      },
      stats: {
        completed,
        pending,
        missed,
        total: all.length,
      },
      buckets: { dueToday, upcoming, late },
      completionRate,
      rank,
      notifications: notifs,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
