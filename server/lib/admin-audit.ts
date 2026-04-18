import { prisma } from './prisma.js';

export async function logAdminAudit(params: {
  adminId: string;
  action: string;
  status?: string;
  details?: string | null;
}) {
  await prisma.adminAuditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      status: params.status ?? 'success',
      details: params.details ?? null,
    },
  });
}
