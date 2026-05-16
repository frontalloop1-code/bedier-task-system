import { prisma } from '../config/prisma.js';

const DEFAULTS = {
  general_task_points: 1,
  daily_completion_bonus: 2,
  warning_thresholds: [2, 3],
  late_penalty_points: 1,
  missed_penalty_points: 1,
  max_fault_points: 4,
};

export async function getSetting(key) {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (row) return row.value;
  return DEFAULTS[key];
}

export async function getAllSettings() {
  const rows = await prisma.setting.findMany();
  const merged = { ...DEFAULTS };
  for (const r of rows) merged[r.key] = r.value;
  return merged;
}

export async function setSetting(key, value) {
  return prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
