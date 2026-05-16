import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.actorId) where.actorId = String(req.query.actorId);
    if (req.query.type) where.type = String(req.query.type);
    const items = await prisma.activityLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: Number(req.query.limit || 100),
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;
