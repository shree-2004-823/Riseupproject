import { UserRole } from '@prisma/client';
import { startOfDay, subDays } from 'date-fns';
import { Router } from 'express';
import { env } from '../config/env.js';
import { logAdminAudit } from '../lib/admin-audit.js';
import { hashPassword, setAuthCookie, signToken } from '../lib/auth.js';
import { formatQuoteCategory } from '../lib/domain.js';
import { asyncHandler, HttpError } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/require-admin.js';
import { adminAccessKeySchema } from '../validators/auth.js';

export const adminRouter = Router();

function isAdminRole(role: string) {
  return role === 'admin' || role === 'super_admin';
}

function isRealUserRole(role: UserRole) {
  return role === UserRole.USER;
}

function serializeUser(user: {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  phoneNumber: string | null;
  phoneVerifiedAt: Date | null;
  role: string;
  onboardingCompleted: boolean;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    phoneNumber: user.phoneNumber,
    phoneVerified: Boolean(user.phoneVerifiedAt),
    role: user.role.toLowerCase(),
    onboardingCompleted: user.onboardingCompleted,
  };
}

async function getOrCreateAdminAccessUser() {
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: {
        in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (existingAdmin) {
    return existingAdmin;
  }

  return prisma.user.create({
    data: {
      fullName: 'RiseUp Admin',
      email: 'admin@example.com',
      username: 'admin',
      usernameLower: 'admin',
      passwordHash: await hashPassword('admin-access-bootstrap'),
      role: UserRole.ADMIN,
      onboardingCompleted: true,
    },
  });
}

adminRouter.post(
  '/login',
  asyncHandler(async (request, response) => {
    const parsed = adminAccessKeySchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid admin access payload', parsed.error.flatten());
    }

    if (parsed.data.accessKey !== env.ADMIN_ACCESS_KEY) {
      throw new HttpError(403, 'Invalid admin access key');
    }

    const user = await getOrCreateAdminAccessUser();

    if (!isAdminRole(user.role.toLowerCase())) {
      throw new HttpError(403, 'Admin access required');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(response, token);
    await logAdminAudit({
      adminId: user.id,
      action: 'admin_key_login',
      details: 'Successful admin access with secret key',
    });

    response.json({
      message: 'Admin access granted',
      user: serializeUser(user),
    });
  }),
);

adminRouter.use(authenticate);
adminRouter.use(requireAdmin);

adminRouter.get(
  '/metrics',
  asyncHandler(async (request, response) => {
    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 7);

    const [
      totalUsers,
      onboardedUsers,
      admins,
      habitCompletionsToday,
      moodCheckInsToday,
      cravingLogsToday,
      relapseEventsToday,
      remindersSentToday,
      remindersActedOnToday,
      newUsersThisWeek,
      recentUsers,
      recentHabitLogs,
      recentMoodLogs,
      recentJournalEntries,
      recentCravingLogs,
      recentChallengeJoins,
      habitActorsToday,
      moodActorsToday,
      cravingActorsToday,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: UserRole.USER },
      }),
      prisma.user.count({
        where: {
          role: UserRole.USER,
          onboardingCompleted: true,
        },
      }),
      prisma.user.count({
        where: {
          role: {
            in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
          },
        },
      }),
      prisma.habitLog.count({
        where: {
          completed: true,
          completedAt: { gte: today },
        },
      }),
      prisma.moodLog.count({
        where: {
          date: { gte: today },
        },
      }),
      prisma.cravingLog.count({
        where: {
          occurredAt: { gte: today },
        },
      }),
      prisma.relapseEvent.count({
        where: {
          occurredAt: { gte: today },
        },
      }),
      prisma.reminderEvent.count({
        where: {
          sentAt: { gte: today },
        },
      }),
      prisma.reminderEvent.count({
        where: {
          actedAt: { gte: today },
        },
      }),
      prisma.user.count({
        where: {
          role: UserRole.USER,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.user.findMany({
        where: {
          role: UserRole.USER,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
        },
      }),
      prisma.habitLog.findMany({
        where: {
          completed: true,
          completedAt: { not: null },
          user: { role: UserRole.USER },
        },
        orderBy: { completedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          completedAt: true,
          habit: {
            select: { name: true },
          },
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.moodLog.findMany({
        where: {
          user: { role: UserRole.USER },
        },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          id: true,
          date: true,
          moodLabel: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.journalEntry.findMany({
        where: {
          user: { role: UserRole.USER },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.cravingLog.findMany({
        where: {
          user: { role: UserRole.USER },
        },
        orderBy: { occurredAt: 'desc' },
        take: 5,
        select: {
          id: true,
          occurredAt: true,
          outcome: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.challengeParticipant.findMany({
        where: {
          user: { role: UserRole.USER },
        },
        orderBy: { joinedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          joinedAt: true,
          challenge: {
            select: { title: true },
          },
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.habitLog.findMany({
        where: {
          completedAt: { gte: today },
          user: { role: UserRole.USER },
        },
        distinct: ['userId'],
        select: {
          userId: true,
        },
      }),
      prisma.moodLog.findMany({
        where: {
          date: { gte: today },
          user: { role: UserRole.USER },
        },
        distinct: ['userId'],
        select: {
          userId: true,
        },
      }),
      prisma.cravingLog.findMany({
        where: {
          occurredAt: { gte: today },
          user: { role: UserRole.USER },
        },
        distinct: ['userId'],
        select: {
          userId: true,
        },
      }),
    ]);

    const activeToday = new Set([
      ...habitActorsToday.map((entry) => entry.userId),
      ...moodActorsToday.map((entry) => entry.userId),
      ...cravingActorsToday.map((entry) => entry.userId),
    ]).size;

    await logAdminAudit({
      adminId: request.auth!.userId,
      action: 'view_admin_metrics',
      details: 'Viewed dashboard metrics',
    });

    const recentActivity = [
      ...recentUsers.map((user) => ({
        id: `user-${user.id}`,
        actor: user.fullName,
        action: 'Created an account',
        email: user.email,
        at: user.createdAt.toISOString(),
      })),
      ...recentHabitLogs.map((log) => ({
        id: `habit-${log.id}`,
        actor: log.user.fullName,
        action: `Completed habit: ${log.habit.name}`,
        email: log.user.email,
        at: log.completedAt!.toISOString(),
      })),
      ...recentMoodLogs.map((log) => ({
        id: `mood-${log.id}`,
        actor: log.user.fullName,
        action: `Checked in mood: ${log.moodLabel.toLowerCase()}`,
        email: log.user.email,
        at: log.date.toISOString(),
      })),
      ...recentJournalEntries.map((entry) => ({
        id: `journal-${entry.id}`,
        actor: entry.user.fullName,
        action: `Wrote journal entry${entry.title ? `: ${entry.title}` : ''}`,
        email: entry.user.email,
        at: entry.createdAt.toISOString(),
      })),
      ...recentCravingLogs.map((log) => ({
        id: `craving-${log.id}`,
        actor: log.user.fullName,
        action: `Logged craving: ${log.outcome.toLowerCase()}`,
        email: log.user.email,
        at: log.occurredAt.toISOString(),
      })),
      ...recentChallengeJoins.map((entry) => ({
        id: `challenge-${entry.id}`,
        actor: entry.user.fullName,
        action: `Joined challenge: ${entry.challenge.title}`,
        email: entry.user.email,
        at: entry.joinedAt.toISOString(),
      })),
    ]
      .sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime())
      .slice(0, 10);

    response.json({
      stats: {
        totalUsers,
        activeToday,
        onboardedUsers,
        admins,
        newUsersThisWeek,
        habitCompletionsToday,
        moodCheckInsToday,
        cravingLogsToday,
        relapseEventsToday,
        remindersSentToday,
        remindersActedOnToday,
      },
      recentActivity,
    });
  }),
);

adminRouter.get(
  '/users',
  asyncHandler(async (request, response) => {
    const users = await prisma.user.findMany({
      where: {
        role: UserRole.USER,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            habits: true,
            moodLogs: true,
            cravingLogs: true,
            dailyPlans: true,
            journalEntries: true,
          },
        },
      },
    });

    await logAdminAudit({
      adminId: request.auth!.userId,
      action: 'view_admin_users',
      details: `Viewed ${users.length} users`,
    });

    response.json({
      users: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role.toLowerCase(),
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt.toISOString(),
        stats: {
          habits: user._count.habits,
          moodLogs: user._count.moodLogs,
          cravingLogs: user._count.cravingLogs,
          dailyPlans: user._count.dailyPlans,
          journalEntries: user._count.journalEntries,
        },
      })),
    });
  }),
);

adminRouter.get(
  '/quotes',
  asyncHandler(async (request, response) => {
    const quotes = await prisma.quote.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    await logAdminAudit({
      adminId: request.auth!.userId,
      action: 'view_admin_quotes',
      details: `Viewed ${quotes.length} quotes`,
    });

    response.json({
      quotes: quotes.map((quote) => ({
        id: quote.id,
        content: quote.content,
        author: quote.author,
        category: formatQuoteCategory(quote.category),
        isActive: quote.isActive,
        sortOrder: quote.sortOrder,
        createdAt: quote.createdAt.toISOString(),
        updatedAt: quote.updatedAt.toISOString(),
      })),
    });
  }),
);

adminRouter.get(
  '/audit',
  asyncHandler(async (request, response) => {
    await logAdminAudit({
      adminId: request.auth!.userId,
      action: 'view_admin_audit',
      details: 'Viewed admin audit trail',
    });

    const logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    response.json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        status: log.status,
        details: log.details,
        createdAt: log.createdAt.toISOString(),
        admin: {
          id: log.admin.id,
          fullName: log.admin.fullName,
          email: log.admin.email,
          role: log.admin.role.toLowerCase(),
        },
      })),
    });
  }),
);
