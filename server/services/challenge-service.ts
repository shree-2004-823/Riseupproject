import { ChallengeType, CravingOutcome, HabitDifficulty } from '@prisma/client';
import { addDays, differenceInCalendarDays, eachDayOfInterval, startOfDay } from 'date-fns';
import { formatChallengeType, formatHabitDifficulty } from '../lib/domain.js';
import { getDateKey } from '../lib/dates.js';
import { prisma } from '../lib/prisma.js';

type ChallengeRow = {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  durationDays: number;
  difficulty: HabitDifficulty;
  rewardBadgeText: string | null;
  isActive: boolean;
};

type ParticipantRow = {
  challengeId: string;
  joinedAt: Date;
  completedAt: Date | null;
};

const hydrationKeywords = ['water', 'hydrate', 'hydration'];

function isHydrationHabit(name: string) {
  const normalized = name.toLowerCase();
  return hydrationKeywords.some((keyword) => normalized.includes(keyword));
}

function getSuccessForDay(params: {
  type: ChallengeType;
  dateKey: string;
  relapsedDateKeys: Set<string>;
  resistedDateKeys: Set<string>;
  moodDateKeys: Set<string>;
  journalDateKeys: Set<string>;
  physicalHabitDateKeys: Set<string>;
  hydrationHabitDateKeys: Set<string>;
}) {
  const {
    type,
    dateKey,
    relapsedDateKeys,
    resistedDateKeys,
    moodDateKeys,
    journalDateKeys,
    physicalHabitDateKeys,
    hydrationHabitDateKeys,
  } = params;

  if (type === ChallengeType.NO_SMOKING) {
    return !relapsedDateKeys.has(dateKey);
  }

  if (type === ChallengeType.WORKOUT) {
    return physicalHabitDateKeys.has(dateKey);
  }

  if (type === ChallengeType.HYDRATION) {
    return hydrationHabitDateKeys.has(dateKey);
  }

  if (type === ChallengeType.MOOD_CHECKIN) {
    return moodDateKeys.has(dateKey);
  }

  if (type === ChallengeType.JOURNAL) {
    return journalDateKeys.has(dateKey);
  }

  return !relapsedDateKeys.has(dateKey) && (resistedDateKeys.has(dateKey) || moodDateKeys.has(dateKey) || journalDateKeys.has(dateKey));
}

function getChallengeStatus(params: { joined: boolean; daysElapsed: number; daysCompleted: number; durationDays: number }) {
  const { joined, daysElapsed, daysCompleted, durationDays } = params;

  if (!joined) {
    return 'not_started' as const;
  }

  if (daysCompleted >= durationDays) {
    return 'completed' as const;
  }

  if (daysElapsed >= durationDays) {
    return 'expired' as const;
  }

  return 'in_progress' as const;
}

function getTimeLabel(status: 'not_started' | 'in_progress' | 'completed' | 'expired', daysRemaining: number) {
  if (status === 'not_started') {
    return 'Not started';
  }

  if (status === 'completed') {
    return 'Challenge completed';
  }

  if (status === 'expired') {
    return 'Challenge window ended';
  }

  return `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`;
}

export async function buildChallengeSnapshot(userId: string) {
  const [challenges, participants] = await Promise.all([
    prisma.challenge.findMany({
      where: { isActive: true },
      orderBy: [{ durationDays: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        durationDays: true,
        difficulty: true,
        rewardBadgeText: true,
        isActive: true,
      },
    }),
    prisma.challengeParticipant.findMany({
      where: { userId },
      select: {
        challengeId: true,
        joinedAt: true,
        completedAt: true,
      },
    }),
  ]);

  const participantByChallengeId = new Map(participants.map((participant) => [participant.challengeId, participant]));
  const joinedParticipants = participants.filter((participant) => challenges.some((challenge) => challenge.id === participant.challengeId));

  if (joinedParticipants.length === 0) {
    return {
      challenges: challenges.map((challenge) => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: formatChallengeType(challenge.type),
        difficulty: formatHabitDifficulty(challenge.difficulty),
        joined: false,
        progressPercentage: 0,
        daysCompleted: 0,
        durationDays: challenge.durationDays,
        completionStatus: 'not_started' as const,
        rewardBadgeText: challenge.rewardBadgeText,
        timeLabel: 'Not started',
      })),
    };
  }

  const earliestJoinDate = joinedParticipants.reduce((earliest, participant) => {
    const date = startOfDay(participant.joinedAt);
    return date.getTime() < earliest.getTime() ? date : earliest;
  }, startOfDay(joinedParticipants[0].joinedAt));

  const [activeHabits, habitLogs, cravingLogs, moodLogs, journalEntries] = await Promise.all([
    prisma.habit.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        countsAsWorkout: true,
      },
    }),
    prisma.habitLog.findMany({
      where: {
        userId,
        completed: true,
        dateKey: {
          gte: getDateKey(earliestJoinDate),
        },
      },
      select: {
        habitId: true,
        dateKey: true,
      },
    }),
    prisma.cravingLog.findMany({
      where: {
        userId,
        occurredAt: { gte: earliestJoinDate },
      },
      select: {
        outcome: true,
        occurredAt: true,
      },
    }),
    prisma.moodLog.findMany({
      where: {
        userId,
        date: { gte: earliestJoinDate },
      },
      select: {
        date: true,
      },
    }),
    prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: { gte: earliestJoinDate },
      },
      select: {
        createdAt: true,
      },
    }),
  ]);

  const physicalHabitIds = new Set(
    activeHabits
      .filter((habit) => habit.countsAsWorkout || habit.category === 'PHYSICAL')
      .map((habit) => habit.id),
  );
  const hydrationHabitIds = new Set(activeHabits.filter((habit) => isHydrationHabit(habit.name)).map((habit) => habit.id));
  const physicalHabitDateKeys = new Set(
    habitLogs.filter((log) => physicalHabitIds.has(log.habitId)).map((log) => log.dateKey),
  );
  const hydrationHabitDateKeys = new Set(
    habitLogs.filter((log) => hydrationHabitIds.has(log.habitId)).map((log) => log.dateKey),
  );
  const relapsedDateKeys = new Set(
    cravingLogs.filter((log) => log.outcome === CravingOutcome.RELAPSED).map((log) => getDateKey(log.occurredAt)),
  );
  const resistedDateKeys = new Set(
    cravingLogs.filter((log) => log.outcome === CravingOutcome.RESISTED).map((log) => getDateKey(log.occurredAt)),
  );
  const moodDateKeys = new Set(moodLogs.map((log) => getDateKey(log.date)));
  const journalDateKeys = new Set(journalEntries.map((entry) => getDateKey(entry.createdAt)));
  const today = startOfDay(new Date());

  const snapshotChallenges = challenges.map((challenge) => {
      const participant = participantByChallengeId.get(challenge.id);

      if (!participant) {
        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          type: formatChallengeType(challenge.type),
          difficulty: formatHabitDifficulty(challenge.difficulty),
          joined: false,
          progressPercentage: 0,
          daysCompleted: 0,
          durationDays: challenge.durationDays,
          completionStatus: 'not_started' as const,
          rewardBadgeText: challenge.rewardBadgeText,
          timeLabel: 'Not started',
        };
      }

      const joinedDate = startOfDay(participant.joinedAt);
      const targetEndDate = addDays(joinedDate, challenge.durationDays - 1);
      const evaluatedEndDate = targetEndDate.getTime() < today.getTime() ? targetEndDate : today;
      const intervalDays =
        evaluatedEndDate.getTime() >= joinedDate.getTime()
          ? eachDayOfInterval({ start: joinedDate, end: evaluatedEndDate })
          : [];

      let daysCompleted = 0;

      for (const date of intervalDays) {
        const dateKey = getDateKey(date);
        if (
          getSuccessForDay({
            type: challenge.type,
            dateKey,
            relapsedDateKeys,
            resistedDateKeys,
            moodDateKeys,
            journalDateKeys,
            physicalHabitDateKeys,
            hydrationHabitDateKeys,
          })
        ) {
          daysCompleted += 1;
        }
      }

      const daysElapsed = intervalDays.length;
      const progressPercentage = Math.min(Math.round((daysCompleted / challenge.durationDays) * 100), 100);
      const completionStatus = getChallengeStatus({
        joined: true,
        daysElapsed,
        daysCompleted,
        durationDays: challenge.durationDays,
      });
      const daysRemaining = Math.max(challenge.durationDays - daysElapsed, 0);

      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: formatChallengeType(challenge.type),
        difficulty: formatHabitDifficulty(challenge.difficulty),
        joined: true,
        joinedAt: participant.joinedAt.toISOString(),
        progressPercentage,
        daysCompleted,
        durationDays: challenge.durationDays,
        completionStatus,
        rewardBadgeText: challenge.rewardBadgeText,
        timeLabel: getTimeLabel(completionStatus, daysRemaining),
      };
    });

  await prisma.$transaction(
    snapshotChallenges
      .filter((challenge) => challenge.joined)
      .map((challenge) =>
        prisma.challengeParticipant.updateMany({
          where: {
            challengeId: challenge.id,
            userId,
          },
          data: {
            status:
              challenge.completionStatus === 'completed'
                ? 'COMPLETED'
                : challenge.completionStatus === 'expired'
                  ? 'EXPIRED'
                  : 'ACTIVE',
            lastProgressAt: new Date(),
            completedDaysSnapshot: challenge.daysCompleted,
            completionPercentageSnapshot: challenge.progressPercentage,
            ...(challenge.completionStatus === 'completed' ? { completedAt: new Date() } : {}),
          },
        }),
      ),
  );

  return {
    challenges: snapshotChallenges,
  };
}

export async function joinChallenge(userId: string, challengeId: string) {
  const challenge = await prisma.challenge.findFirst({
    where: {
      id: challengeId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!challenge) {
    return null;
  }

  await prisma.challengeParticipant.upsert({
    where: {
      challengeId_userId: {
        challengeId,
        userId,
      },
    },
    update: {},
    create: {
      challengeId,
      userId,
    },
  });

  const snapshot = await buildChallengeSnapshot(userId);
  return snapshot.challenges.find((item) => item.id === challengeId) ?? null;
}

export async function getActiveChallenges(userId: string) {
  const snapshot = await buildChallengeSnapshot(userId);

  return {
    challenges: snapshot.challenges.filter(
      (challenge) => challenge.joined && challenge.completionStatus === 'in_progress',
    ),
  };
}
