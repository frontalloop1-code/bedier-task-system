import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEAMS = [
  { code: 'CREATIVE', name: 'Creative', color: '#ddb7ff' },
  { code: 'OPERATIONS', name: 'Operations', color: '#22c55e' },
  { code: 'TECH', name: 'Tech', color: '#ffb95f' },
];

// Seeded users. Only Hanan and Bedier are Super Admins — Braa/Alaa/Safa are
// regular employees on the Tech team and can be promoted to Team Leader via
// Admin → Teams → Assign.
const ADMIN_ACCOUNTS = [
  {
    name: 'Bedier',
    email: 'bedier@system.com',
    password: 'admin7181',
    role: 'SUPER_ADMIN',
    teamCode: null,
  },
  {
    name: 'Hanan',
    email: 'hanan@system.com',
    password: 'admin123',
    role: 'SUPER_ADMIN',
    teamCode: null,
  },
  {
    name: 'Baraa Mohamed',
    email: 'baraa.mohamed@system.com',
    password: '12345678',
    role: 'EMPLOYEE',
    teamCode: 'TECH',
  },
  {
    name: 'Alaa Ahmed',
    email: 'alaa.ahmed@system.com',
    password: '87654321',
    role: 'EMPLOYEE',
    teamCode: 'TECH',
  },
  {
    name: 'Safa Naser',
    email: 'safa.naser@system.com',
    password: '0123456789',
    role: 'EMPLOYEE',
    teamCode: 'TECH',
  },
];

function avatar(name) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=131b2e,222a3d,2d3449&textColor=adc6ff`;
}

function daysFromNow(d) {
  const x = new Date();
  x.setDate(x.getDate() + d);
  x.setHours(17, 0, 0, 0);
  return x;
}

async function main() {
  console.log('[seed] resetting…');
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.penalty.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.updateMany({ data: { teamId: null } });
  await prisma.team.updateMany({ data: { managerId: null } });
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  console.log('[seed] settings…');
  await prisma.setting.createMany({
    data: [
      { key: 'general_task_points', value: 1 },
      { key: 'daily_completion_bonus', value: 2 },
      { key: 'warning_thresholds', value: [2, 3] },
      { key: 'late_penalty_points', value: 1 },
      { key: 'missed_penalty_points', value: 1 },
      { key: 'max_fault_points', value: 4 },
    ],
  });

  console.log('[seed] teams…');
  const teams = {};
  for (const t of TEAMS) {
    const team = await prisma.team.create({ data: t });
    teams[t.code] = team;
  }

  console.log('[seed] admin users…');
  const created = [];
  for (const acct of ADMIN_ACCOUNTS) {
    const passwordHash = await bcrypt.hash(acct.password, 10);
    const u = await prisma.user.create({
      data: {
        email: acct.email.toLowerCase(),
        passwordHash,
        name: acct.name,
        role: acct.role,
        teamId: acct.teamCode ? teams[acct.teamCode].id : null,
        avatarUrl: avatar(acct.name),
        points: 0,
      },
    });
    created.push(u);
  }

  console.log('[seed] activity log seed entry…');
  await prisma.activityLog.create({
    data: {
      actorId: created[0].id,
      type: 'USER_CREATED',
      entityType: 'System',
      metadata: { event: 'Initial admin accounts seeded', count: created.length },
    },
  });

  console.log('[seed] done.');
  console.log('  Super Admins:');
  console.log('    bedier@system.com / admin7181');
  console.log('    hanan@system.com / admin123');
  console.log('  Tech Team Employees:');
  console.log('    baraa.mohamed@system.com / 12345678');
  console.log('    alaa.ahmed@system.com / 87654321');
  console.log('    safa.naser@system.com / 0123456789');
  console.log('  Promote one Tech employee to Team Leader via /admin/teams.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
