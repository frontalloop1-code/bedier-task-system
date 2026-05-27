import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { apiLimiter } from './middleware/rateLimit.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import teamRoutes from './routes/teams.js';
import taskRoutes from './routes/tasks.js';
import assignmentRoutes from './routes/assignments.js';
import penaltyRoutes from './routes/penalties.js';
import leaderboardRoutes from './routes/leaderboards.js';
import dashboardRoutes from './routes/dashboard.js';
import notificationRoutes from './routes/notifications.js';
import activityRoutes from './routes/activity.js';
import settingsRoutes from './routes/settings.js';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
// FRONTEND_ORIGIN can be a single URL or a comma-separated list — useful for
// allowing local dev (http://localhost:5173) and a deployed frontend
// (https://*.netlify.app) at the same time.
const allowedOrigins = env.FRONTEND_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      // Same-origin / curl / server-to-server requests have no Origin header.
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/penalties', penaltyRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/settings', settingsRoutes);

app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[bedier-api] listening on http://localhost:${env.PORT}`);
});
