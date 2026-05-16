import { HttpError } from '../utils/httpError.js';
import { ZodError } from 'zod';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err?.code === 'P2002') {
    return res.status(409).json({ error: 'Unique constraint violation', details: err.meta });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Route not found' });
}
