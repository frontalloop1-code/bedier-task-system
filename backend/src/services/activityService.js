import { prisma } from '../config/prisma.js';

export async function logActivity({ actorId, type, entityType, entityId, metadata }) {
  return prisma.activityLog.create({
    data: { actorId, type, entityType, entityId, metadata },
  });
}
