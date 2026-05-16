import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const userCreateSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUPER_ADMIN', 'TEAM_MANAGER', 'EMPLOYEE']),
  teamId: z.string().nullish(),
  avatarUrl: z.string().url().nullish(),
});

export const userUpdateSchema = userCreateSchema
  .partial()
  .extend({ isActive: z.boolean().optional(), password: z.string().min(6).optional() });

export const teamCreateSchema = z.object({
  code: z.enum(['CREATIVE', 'OPERATIONS', 'TECH']),
  name: z.string().min(1),
  color: z.string().min(1),
  description: z.string().nullish(),
  managerId: z.string().nullish(),
});

export const teamUpdateSchema = teamCreateSchema.partial();

export const taskCreateSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().nullish(),
  type: z.enum(['GENERAL', 'TEAM', 'PRIVATE']),
  teamId: z.string().nullish(),
  dueAt: z.string().datetime().or(z.string().min(1)),
  points: z.number().int().min(0).max(50).default(1),
  proofRequired: z.boolean().default(false),
  assigneeIds: z.array(z.string()).default([]),
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const reviewSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  note: z.string().nullish(),
});

export const penaltySchema = z.object({
  userId: z.string(),
  type: z.enum(['MISSED', 'LATE', 'MANUAL']).default('MANUAL'),
  points: z.number().int().min(1).max(20).default(1),
  reason: z.string().min(1),
});

export const settingsUpdateSchema = z.object({
  value: z.any(),
});
