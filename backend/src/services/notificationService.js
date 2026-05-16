import { prisma } from '../config/prisma.js';

export async function notify(userId, { type, title, body, link } = {}) {
  return prisma.notification.create({
    data: { userId, type, title, body, link },
  });
}

export async function notifyMany(userIds, payload) {
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, ...payload })),
  });
}
