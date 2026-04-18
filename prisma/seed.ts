import { ChallengeType, HabitDifficulty, PrismaClient, QuoteCategory, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_QUOTES = [
  {
    content: 'Small steps still move you forward.',
    author: 'Unknown',
    category: QuoteCategory.MOTIVATION,
    sortOrder: 1,
  },
  {
    content: 'Discipline is remembering what you want most.',
    author: 'Unknown',
    category: QuoteCategory.DISCIPLINE,
    sortOrder: 2,
  },
  {
    content: 'Pause. Breathe. Begin again.',
    author: 'Unknown',
    category: QuoteCategory.CALM,
    sortOrder: 3,
  },
  {
    content: 'Recovery counts as progress.',
    author: 'Unknown',
    category: QuoteCategory.RECOVERY,
    sortOrder: 4,
  },
  {
    content: 'A setback is not the end of your story.',
    author: 'Unknown',
    category: QuoteCategory.COMEBACK,
    sortOrder: 5,
  },
  {
    content: 'Focus on the next right action.',
    author: 'Unknown',
    category: QuoteCategory.FOCUS,
    sortOrder: 6,
  },
];

const DEFAULT_CHALLENGES = [
  {
    title: '7 Days No Smoking',
    description: 'Go seven days without a relapse and strengthen your quit momentum.',
    type: ChallengeType.NO_SMOKING,
    durationDays: 7,
    difficulty: HabitDifficulty.HARD,
    rewardBadgeText: 'Smoke-Free Starter',
  },
  {
    title: '14 Day Workout Reset',
    description: 'Complete at least one physical habit each day for the next two weeks.',
    type: ChallengeType.WORKOUT,
    durationDays: 14,
    difficulty: HabitDifficulty.MEDIUM,
    rewardBadgeText: 'Momentum Builder',
  },
  {
    title: '7 Day Mood Check-In',
    description: 'Log your mood every day for a full week to reveal real patterns.',
    type: ChallengeType.MOOD_CHECKIN,
    durationDays: 7,
    difficulty: HabitDifficulty.EASY,
    rewardBadgeText: 'Self-Awareness Badge',
  },
  {
    title: '21 Day Journal Streak',
    description: 'Capture one journal reflection each day for twenty-one days.',
    type: ChallengeType.JOURNAL,
    durationDays: 21,
    difficulty: HabitDifficulty.MEDIUM,
    rewardBadgeText: 'Reflection Ritual',
  },
  {
    title: '10 Day Recovery Reset',
    description: 'String together ten recovery-focused days with no relapse and at least one support action.',
    type: ChallengeType.RECOVERY,
    durationDays: 10,
    difficulty: HabitDifficulty.HARD,
    rewardBadgeText: 'Recovery Reset',
  },
];

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      username: 'admin',
      usernameLower: 'admin',
    },
    create: {
      fullName: 'Admin',
      email: 'admin@example.com',
      username: 'admin',
      usernameLower: 'admin',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      onboardingCompleted: true,
    },
  });

  for (const quote of DEFAULT_QUOTES) {
    const existing = await prisma.quote.findFirst({
      where: {
        content: quote.content,
        category: quote.category,
      },
    });

    if (!existing) {
      await prisma.quote.create({ data: quote });
    }
  }

  for (const challenge of DEFAULT_CHALLENGES) {
    await prisma.challenge.upsert({
      where: { title: challenge.title },
      update: {
        description: challenge.description,
        type: challenge.type,
        durationDays: challenge.durationDays,
        difficulty: challenge.difficulty,
        rewardBadgeText: challenge.rewardBadgeText,
        isActive: true,
      },
      create: challenge,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
