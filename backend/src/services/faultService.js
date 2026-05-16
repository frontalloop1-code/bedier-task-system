import { prisma } from '../config/prisma.js';
import { getSetting } from './settingsService.js';
import { logActivity } from './activityService.js';
import { notify } from './notificationService.js';

export async function issuePenalty({
  userId,
  type,
  points,
  reason,
  taskAssignmentId,
  issuedById,
}) {
  const penalty = await prisma.penalty.create({
    data: {
      userId,
      type,
      points: -Math.abs(points),
      reason,
      taskAssignmentId,
      issuedById,
    },
  });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      points: { decrement: Math.abs(points) },
      faultCount: { increment: 1 },
    },
  });

  const thresholds = await getSetting('warning_thresholds');
  let newLevel = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (updated.faultCount >= thresholds[i]) newLevel = i + 1;
  }
  if (newLevel !== updated.warningLevel) {
    await prisma.user.update({
      where: { id: userId },
      data: { warningLevel: newLevel },
    });
  }

  await notify(userId, {
    type: 'FAULT_ISSUED',
    title: `Penalty issued (-${Math.abs(points)})`,
    body: reason,
  });
  await logActivity({
    actorId: issuedById,
    type: 'PENALTY_ISSUED',
    entityType: 'Penalty',
    entityId: penalty.id,
    metadata: { points: penalty.points, reason, type },
  });

  return penalty;
}

export async function runFaultScan() {
  const now = new Date();
  const overdue = await prisma.taskAssignment.findMany({
    where: {
      status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
      task: { dueAt: { lt: now } },
    },
    include: { task: true },
  });

  const missedPoints = await getSetting('missed_penalty_points');

  let count = 0;
  for (const a of overdue) {
    await prisma.taskAssignment.update({
      where: { id: a.id },
      data: { status: 'MISSED' },
    });
    await issuePenalty({
      userId: a.userId,
      type: 'MISSED',
      points: missedPoints,
      reason: `Missed task: ${a.task.title}`,
      taskAssignmentId: a.id,
      issuedById: null,
    });
    count++;
  }
  return { missed: count };
}
