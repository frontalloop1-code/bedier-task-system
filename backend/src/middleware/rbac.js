import { forbidden } from '../utils/httpError.js';

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TEAM_MANAGER: 'TEAM_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export function requireRole(...allowed) {
  return (req, _res, next) => {
    if (!req.user) return next(forbidden('No user on request'));
    if (!allowed.includes(req.user.role)) return next(forbidden('Insufficient role'));
    next();
  };
}

export const requireAdmin = requireRole(ROLES.SUPER_ADMIN);
export const requireManagerOrAdmin = requireRole(ROLES.SUPER_ADMIN, ROLES.TEAM_MANAGER);

export function isAdmin(user) {
  return user?.role === ROLES.SUPER_ADMIN;
}
export function isManager(user) {
  return user?.role === ROLES.TEAM_MANAGER;
}

export function canAccessTeam(user, teamId) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (!teamId) return false;
  return user.teamId === teamId;
}

export function buildTaskVisibilityFilter(user) {
  if (isAdmin(user)) return {};
  if (isManager(user)) {
    return {
      OR: [
        { type: 'GENERAL' },
        { teamId: user.teamId },
        { assignments: { some: { userId: user.id } } },
      ],
    };
  }
  return {
    OR: [
      { type: 'GENERAL' },
      { AND: [{ type: 'TEAM' }, { teamId: user.teamId }] },
      { assignments: { some: { userId: user.id } } },
    ],
  };
}
