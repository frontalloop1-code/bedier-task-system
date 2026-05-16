import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { loginSchema } from '../validators/schemas.js';
import { signToken } from '../utils/jwt.js';
import { verifyPassword } from '../utils/hash.js';
import { unauthorized } from '../utils/httpError.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { logActivity } from '../services/activityService.js';

const router = Router();

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { team: true },
    });
    if (!user || !user.isActive) throw unauthorized('Invalid credentials');
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw unauthorized('Invalid credentials');

    const token = signToken({ sub: user.id, role: user.role });
    await logActivity({
      actorId: user.id,
      type: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
    });
    res.json({ token, user: stripUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: stripUser(req.user) });
});

function stripUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export default router;
