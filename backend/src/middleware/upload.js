import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { nanoid } from 'nanoid';
import { env } from '../config/env.js';
import { badRequest } from '../utils/httpError.js';

const UPLOAD_DIR = path.resolve(env.UPLOAD_DIR);
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${nanoid(10)}${ext}`);
  },
});

export const uploadProof = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(badRequest(`Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  },
}).single('proof');

export function getUploadDir() {
  return UPLOAD_DIR;
}
