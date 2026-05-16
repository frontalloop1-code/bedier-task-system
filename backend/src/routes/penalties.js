import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { isAdmin, isManager, requireManagerOrAdmin } from '../middleware/rbac.js';
import { penaltySchema } from '../validators/schemas.js';
import { forbidden } from '../utils/httpError.js';
import { issuePenalty } from '../services/faultService.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireManagerOrAdmin, async (req, res, next) => {
  try {
    const where = {};
    if (isManager(req.user)) {
      where.user = { teamId: req.user.teamId };
    }
    if (req.query.userId) where.userId = String(req.query.userId);
    const penalties = await prisma.penalty.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, teamId: true } },
        issuedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ penalties });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireManagerOrAdmin, async (req, res, next) => {
  try {
    const body = penaltySchema.parse(req.body);
    if (isManager(req.user)) {
      const target = await prisma.user.findUnique({ where: { id: body.userId } });
      if (!target || target.teamId !== req.user.teamId) throw forbidden();
    }
    const penalty = await issuePenalty({ ...body, issuedById: req.user.id });
    res.status(201).json({ penalty });
  } catch (err) {
    next(err);
  }
});

export default router;
