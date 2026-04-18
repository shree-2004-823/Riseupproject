import { requireRoles } from './require-roles.js';

export const requireAdmin = requireRoles('ADMIN', 'SUPER_ADMIN');
