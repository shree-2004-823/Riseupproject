import { ChallengeParticipantStatus } from '@prisma/client';
import { startOfDay } from 'date-fns';
import { Router } from 'express';
import { formatChallengeType, formatHabitDifficulty } from '../lib/domain.js';
import { asyncHandler } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/authenticate.js';
import { buildChallengeSnapshot } from '../services/challenge-service.js';

export const communityRouter = Router();

communityRouter.use(authenticate);

communityRouter.get(
  '/',
  asyncHandler(async (request, response) => {
    const userId = request.auth!.userId;
    const today = startOfDay(new Date());

    const [
      onboardedMembers,
      habitActors,
      moodActors,
      cravingActors,
      journalActors,
      habitWinsToday,
      moodCheckInsToday,
      resistedCravingsToday,
      journalEntriesToday,
      challenges,
      snapshot,
    ] = await Promise.all([
      prisma.user.count({
        where: { onboardingCompleted: true },
      }),
      prisma.habitLog.findMany({
        where: {
          completedAt: { gte: today },
        },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.moodLog.findMany({
        where: {
          date: { gte: today },
        },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.cravingLog.findMany({
        where: {
          occurredAt: { gte: today },
        },
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.journalEntry.findMany({
        where: {
          createdAt: { gte: today },
        },
        distinct: ['userId'],
        select: { userId: true },
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
          outcome: 'RESISTED',
        },
      }),
      prisma.journalEntry.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      prisma.challenge.findMany({
        where: { isActive: true },
        orderBy: [{ createdAt: 'asc' }],
        include: {
          participants: {
            select: {
              status: true,
            },
          },
        },
      }),
      buildChallengeSnapshot(userId),
    ]);

    const activeToday = new Set([
      ...habitActors.map((entry) => entry.userId),
      ...moodActors.map((entry) => entry.userId),
      ...cravingActors.map((entry) => entry.userId),
      ...journalActors.map((entry) => entry.userId),
    ]).size;

    const spotlightChallenges = challenges
      .map((challenge) => {
        const activeParticipants = challenge.participants.filter(
          (participant) => participant.status === ChallengeParticipantStatus.ACTIVE,
        ).length;
        const completedParticipants = challenge.participants.filter(
          (participant) => participant.status === ChallengeParticipantStatus.COMPLETED,
        ).length;

        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          type: formatChallengeType(challenge.type),
          difficulty: formatHabitDifficulty(challenge.difficulty),
          activeParticipants,
          completedParticipants,
        };
      })
      .sort(
        (left, right) =>
          right.activeParticipants - left.activeParticipants ||
          right.completedParticipants - left.completedParticipants ||
          left.title.localeCompare(right.title),
      )
      .slice(0, 4);

    const joinedChallenges = snapshot.challenges.filter((challenge) => challenge.joined);
    const activeChallenges = joinedChallenges.filter((challenge) => challenge.completionStatus === 'in_progress');
    const completedChallenges = joinedChallenges.filter((challenge) => challenge.completionStatus === 'completed');
    const bestChallenge = [...joinedChallenges].sort(
      (left, right) => right.progressPercentage - left.progressPercentage || left.title.localeCompare(right.title),
    )[0];

    response.json({
      summary: {
        totalMembers: onboardedMembers,
        activeToday,
        habitWinsToday,
        moodCheckInsToday,
        resistedCravingsToday,
        journalEntriesToday,
      },
      spotlightChallenges,
      personalMomentum: {
        joinedCount: joinedChallenges.length,
        activeCount: activeChallenges.length,
        completedCount: completedChallenges.length,
        bestChallengeTitle: bestChallenge?.title ?? null,
        bestProgressPercentage: bestChallenge?.progressPercentage ?? 0,
      },
      supportPrinciples: [
        'Progress counts more than perfection.',
        'When the day feels heavy, shrink the task instead of quitting the goal.',
        'A lapse is information, not the end of your comeback.',
      ],
    });
  }),
);
