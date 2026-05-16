import { prisma } from '../config/prisma.js';
import { getSetting } from './settingsService.js';
import { logActivity } from './activityService.js';
import { notify } from './notificationService.js';

export async function computeAwardForTask(task) {
  if (task.type === 'TEAM') return 1;
  if (task.type === 'PRIVATE') return 1;
  if (task.type === 'GENERAL') return await getSetting('general_task_points');
  return 0;
}

export async function awardPointsForApproval(assignmentId, reviewerId) {
  const assignment = await prisma.taskAssignment.findUnique({
    where: { id: assignmentId },
    include: { task: true, user: true },
  });
  if (!assignment) return null;

  const award = await computeAwardForTask(assignment.task);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: assignment.userId },
      data: { points: { increment: award } },
    }),
    prisma.taskAssignment.update({
      where: { id: assignmentId },
      data: { awardedPoints: award },
    }),
  ]);

  await logActivity({
    actorId: reviewerId,
    type: 'POINTS_AWARDED',
    entityType: 'TaskAssignment',
    entityId: assignmentId,
    metadata: { points: award, userId: assignment.userId, taskTitle: assignment.task.title },
  });

  await applyDailyCompletionBonus(assignment.userId);

  return award;
}

async function applyDailyCompletionBonus(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const dueToday = await prisma.taskAssignment.count({
    where: {
      userId,
      task: { dueAt: { gte: start, lte: end } },
    },
  });
  if (dueToday === 0) return;

  const approvedToday = await prisma.taskAssignment.count({
    where: {
      userId,
      status: 'APPROVED',
      task: { dueAt: { gte: start, lte: end } },
    },
  });

  if (approvedToday !== dueToday) return;

  const bonus = await getSetting('daily_completion_bonus');
  await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: bonus } },
  });
  await notify(userId, {
    type: 'TASK_APPROVED',
    title: 'Daily completion bonus',
    body: `+${bonus} points for finishing all of today's tasks`,
  });
  await logActivity({
    actorId: null,
    type: 'POINTS_AWARDED',
    entityType: 'User',
    entityId: userId,
    metadata: { points: bonus, reason: 'daily_completion_bonus' },
  });
}
