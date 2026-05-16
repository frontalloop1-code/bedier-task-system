import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const where = { userId: req.user.id };
    if (req.query.unread === 'true') where.isRead = false;
    const items = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ items, unreadCount });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/read', async (req, res, next) => {
  try {
    const n = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!n || n.userId !== req.user.id) return res.status(404).end();
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
