import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import { unauthorized } from '../utils/httpError.js';

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw unauthorized('Missing token');

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { team: true },
    });
    if (!user || !user.isActive) throw unauthorized('Invalid user');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(unauthorized('Invalid or expired token'));
    }
    next(err);
  }
}
