import {
  CoachMessageRole,
  CoachProvider as PrismaCoachProvider,
  CravingOutcome,
  EnergyLevel,
  PlannerPeriod,
  TaskStatus,
} from '@prisma/client';
import { env } from '../config/env.js';
import { formatMoodLabel, formatPlannerMode, formatPlannerPeriod } from '../lib/domain.js';
import { getDateKey, getDateRange } from '../lib/dates.js';
import { prisma } from '../lib/prisma.js';
import { calculateDateKeyStreak } from '../lib/streaks.js';
import { getCurrentQuitStreakDays } from './quit-support-service.js';
import { joinChallenge } from './challenge-service.js';

const MAX_HISTORY_MESSAGES = 12;

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getTopTrigger(triggers: Array<string | null>) {
  const counts = new Map<string, number>();

  for (const trigger of triggers) {
    if (!trigger) continue;
    counts.set(trigger, (counts.get(trigger) ?? 0) + 1);
  }

  return Array.from(counts.entries()).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

function pickCoachingMode(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('craving') ||
    normalized.includes('urge') ||
    normalized.includes('smoke') ||
    normalized.includes('smok') ||
    normalized.includes('nicotine') ||
    normalized.includes('relapse')
  ) {
    return 'recovery';
  }

  if (
    normalized.includes('sad') ||
    normalized.includes('low') ||
    normalized.includes('anxious') ||
    normalized.includes('stressed') ||
    normalized.includes('feel')
  ) {
    return 'calm-support';
  }

  if (
    normalized.includes('plan') ||
    normalized.includes('day') ||
    normalized.includes('schedule') ||
    normalized.includes('task')
  ) {
    return 'planner';
  }

  if (
    normalized.includes('progress') ||
    normalized.includes('review') ||
    normalized.includes('improve') ||
    normalized.includes('consistency')
  ) {
    return 'progress-review';
  }

  return 'coach';
}

function detectHighRiskDistress(message: string) {
  const normalized = message.toLowerCase();
  const phrases = ['kill myself', 'end my life', 'want to die', 'suicide', 'self harm', 'hurt myself'];

  return phrases.some((phrase) => normalized.includes(phrase));
}

function buildCrisisSupportReply() {
  return (
    "I'm really glad you said this out loud. Please pause everything else and reach out to a trusted person or your local emergency or crisis service right now, and stay around people instead of being alone. If talking feels hard, send a short message like 'I need help and I do not want to be alone right now.'"
  );
}

function buildConversationTitle(message: string) {
  const trimmed = message.trim().replace(/\s+/g, ' ');

  if (!trimmed) {
    return 'New coaching chat';
  }

  return trimmed.length > 48 ? `${trimmed.slice(0, 45)}...` : trimmed;
}

function getPlannerPeriodForNow() {
  const hour = new Date().getHours();

  if (hour < 12) return PlannerPeriod.MORNING;
  if (hour < 17) return PlannerPeriod.AFTERNOON;
  if (hour < 21) return PlannerPeriod.EVENING;
  return PlannerPeriod.NIGHT;
}

function getScheduledTimeForPeriod(period: PlannerPeriod) {
  if (period === PlannerPeriod.MORNING) return '09:00';
  if (period === PlannerPeriod.AFTERNOON) return '14:00';
  if (period === PlannerPeriod.EVENING) return '19:00';
  return '21:00';
}

async function ensurePlannerTask(params: {
  userId: string;
  title: string;
  category: string;
  priority: string;
  period: PlannerPeriod;
  energyLevel: EnergyLevel;
  fallbackTask: string;
}) {
  const dateKey = getDateKey();
  const plan = await prisma.dailyPlan.upsert({
    where: {
      userId_dateKey: {
        userId: params.userId,
        dateKey,
      },
    },
    update: {},
    create: {
      userId: params.userId,
      dateKey,
    },
  });

  const existing = await prisma.dailyPlanItem.findFirst({
    where: {
      planId: plan.id,
      title: params.title,
      period: params.period,
    },
  });

  if (existing) {
    return 'That task is already in your planner for today.';
  }

  await prisma.dailyPlanItem.create({
    data: {
      planId: plan.id,
      title: params.title,
      category: params.category,
      priority: params.priority,
      period: params.period,
      energyLevel: params.energyLevel,
      scheduledTime: getScheduledTimeForPeriod(params.period),
      fallbackTask: params.fallbackTask,
    },
  });

  return `Done. I added "${params.title}" to your planner for today.`;
}

async function upsertReminder(params: {
  userId: string;
  type: 'journal' | 'sleep' | 'hydration';
  title: string;
  message: string;
  time: string;
}) {
  const existing = await prisma.reminderSchedule.findFirst({
    where: {
      userId: params.userId,
      habitId: null,
      type: params.type,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (existing) {
    await prisma.reminderSchedule.update({
      where: { id: existing.id },
      data: {
        title: params.title,
        message: params.message,
        time: params.time,
        enabled: true,
      },
    });

    return `Done. I updated your ${params.type} reminder and switched it on.`;
  }

  await prisma.reminderSchedule.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      time: params.time,
      enabled: true,
    },
  });

  return `Done. I created a ${params.type} reminder for you.`;
}

async function joinChallengeByTitle(userId: string, title: string) {
  const challenge = await prisma.challenge.findFirst({
    where: {
      title,
      isActive: true,
    },
    select: { id: true },
  });

  if (!challenge) {
    return 'I could not find that challenge right now.';
  }

  const joined = await joinChallenge(userId, challenge.id);

  if (!joined) {
    return 'I could not join that challenge right now.';
  }

  return `Done. You are now in "${joined.title}".`;
}

export type AIContext = {
  identity: {
    fullName: string | null;
    firstName: string | null;
    username: string | null;
  };
  coachStyle?: string | null;
  habits: {
    total: number;
    completedToday: number;
    streakDays: number;
    activeNames: string[];
  };
  mood: {
    current: string | null;
    latest: {
      label: string | null;
      stress: number | null;
      motivation: number | null;
      focus: number | null;
      energy: number | null;
      timestamp: string | null;
    };
    recentHistory: Array<{
      label: string;
      timestamp: string;
    }>;
    direction: string;
  };
  cravings: {
    todayCount: number;
    topTrigger: string | null;
    resistanceRate: number;
    recent: Array<{
      trigger: string | null;
      intensity: number | null;
      outcome: string;
      timestamp: string;
    }>;
  };
  quitSupport: {
    currentStreak: number;
  };
  planner: {
    mode: string;
    pendingTasks: Array<{
      title: string;
      period: string;
    }>;
    completedCount: number;
    totalCount: number;
  };
  challenges: {
    active: Array<{
      id: string;
      title: string;
      progressPercentage: number;
      completionStatus: string;
    }>;
  };
};

export type CoachChatMessage = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  createdAt: string;
  provider: 'openai' | 'gemini' | 'local' | null;
};

type ChatProvider = 'openai' | 'gemini' | 'local';
type AgentActionKind = 'create_planner_task' | 'upsert_reminder' | 'join_challenge';

export type SuggestedCoachAction = {
  id: string;
  kind: AgentActionKind;
  label: string;
  description: string;
};

type InternalSuggestedCoachAction = SuggestedCoachAction & {
  execute: (params: { userId: string }) => Promise<string>;
};

const MOTIVATION_REFERENCE_THEMES = [
  'progress is built through ordinary repeatable days, not one perfect day',
  'comebacks usually start with a very small reset, not a dramatic life overhaul',
  'confidence often follows action, not the other way around',
  'one bad day is data, not identity',
  'small disciplined moves compound into a version of life that feels completely different later',
];

function getProviderLabel(provider: PrismaCoachProvider | null | undefined): ChatProvider | null {
  if (provider === PrismaCoachProvider.GEMINI) {
    return getPreferredAIProvider();
  }

  if (provider === PrismaCoachProvider.LOCAL) {
    return 'local';
  }

  return null;
}

function getPreferredAIProvider(): Extract<ChatProvider, 'openai' | 'gemini'> {
  if (env.AI_PROVIDER === 'openai' && env.OPENAI_API_KEY) {
    return 'openai';
  }

  if (env.AI_PROVIDER === 'gemini' && env.GEMINI_API_KEY) {
    return 'gemini';
  }

  if (env.OPENAI_API_KEY) {
    return 'openai';
  }

  return 'gemini';
}

function getFriendlyName(context: AIContext) {
  return context.identity.firstName ?? context.identity.username ?? 'bro';
}

function buildFallbackCoachReply(params: { message: string; context: AIContext }) {
  const { message, context } = params;
  const mode = pickCoachingMode(message);
  const name = getFriendlyName(context);

  if (mode === 'recovery') {
    return `${name}, you can get through this urge. You've already resisted ${context.cravings.resistanceRate}% of recent cravings, and your current quit streak is ${context.quitSupport.currentStreak} days. ${
      context.cravings.topTrigger
        ? `Your main trigger looks like ${context.cravings.topTrigger}, so plan one fast replacement for that moment. `
        : ''
    }${
      context.planner.pendingTasks[0]
        ? `Right now, shift into ${context.planner.pendingTasks[0].title.toLowerCase()} during the ${context.planner.pendingTasks[0].period}.`
        : 'Right now, step away, hydrate, and change your environment for ten minutes.'
    }`;
  }

  if (mode === 'calm-support') {
    return `Alright ${name}, let's lower the pressure and protect momentum. Your recent mood trend is ${context.mood.direction}, and your current mood reads ${
      context.mood.current ?? 'unclear'
    }. Keep today's goal small: finish one manageable task and one supportive habit. ${
      context.planner.pendingTasks[0]
        ? `Start with ${context.planner.pendingTasks[0].title.toLowerCase()} so the day feels winnable.`
        : 'If the day feels heavy, choose a five-minute reset before asking more from yourself.'
    }`;
  }

  if (mode === 'planner') {
    return `Alright ${name}, here's the strongest next move for today. You've completed ${context.habits.completedToday}/${context.habits.total} habits so far and you're in ${context.planner.mode} mode. ${
      context.planner.pendingTasks.length > 0
        ? `Prioritize ${context.planner.pendingTasks[0].title.toLowerCase()} next, then stop and reassess your energy.`
        : 'Your planner is clear, so set one short focus block and one recovery block to finish the day cleanly.'
    }`;
  }

  if (mode === 'progress-review') {
    return `${name}, your trend is moving through real structure, not just motivation. You're on a ${context.habits.streakDays}-day habit streak, with ${context.habits.completedToday}/${context.habits.total} habits done today. ${
      context.cravings.todayCount > 0
        ? `You also faced ${context.cravings.todayCount} craving moments today, which makes consistency even more meaningful.`
        : 'There were no craving spikes logged today, which gives you a good window to reinforce routine.'
    } The next gain is protecting your strongest part of the day and not overloading the weaker one.`;
  }

  return `${name}, you're not starting from zero here. Right now you have ${context.habits.completedToday}/${context.habits.total} habits completed today, a ${context.habits.streakDays}-day streak, and your mood trend looks ${context.mood.direction}. ${
    context.planner.pendingTasks[0]
      ? `I'd focus on ${context.planner.pendingTasks[0].title.toLowerCase()} next and keep the rest of the day simple.`
      : "I'd focus on one small win next and keep the rest of the day simple."
  }`;
}

function serializeMessage(message: {
  id: string;
  role: CoachMessageRole;
  provider: PrismaCoachProvider | null;
  content: string;
  createdAt: Date;
}): CoachChatMessage {
  return {
    id: message.id,
    role: message.role === CoachMessageRole.USER ? 'user' : 'ai',
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    provider: getProviderLabel(message.provider),
  };
}

async function getConversationMessages(conversationId: string) {
  const messages = await prisma.coachMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });

  return messages.map(serializeMessage);
}

async function getCurrentConversation(userId: string, conversationId?: string) {
  if (conversationId) {
    const requestedConversation = await prisma.coachConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (requestedConversation) {
      return requestedConversation;
    }
  }

  const activeConversation = await prisma.coachConversation.findFirst({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  if (activeConversation) {
    return activeConversation;
  }

  return prisma.coachConversation.create({
    data: {
      userId,
      title: 'New coaching chat',
      isActive: true,
    },
  });
}

function getConversationProvider(messages: CoachChatMessage[]): ChatProvider {
  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === 'ai' && message.provider);
  return latestAssistantMessage?.provider ?? 'local';
}

function buildSuggestedActions(params: { message: string; context: AIContext }): InternalSuggestedCoachAction[] {
  const { message, context } = params;
  const normalized = message.toLowerCase();
  const actions: InternalSuggestedCoachAction[] = [];
  const nextPeriod = getPlannerPeriodForNow();
  const hasNoSmokingChallenge = context.challenges.active.some((challenge) =>
    challenge.title.toLowerCase().includes('smoking'),
  );
  const hasMoodChallenge = context.challenges.active.some((challenge) =>
    challenge.title.toLowerCase().includes('mood'),
  );

  const addAction = (action: InternalSuggestedCoachAction) => {
    if (!actions.some((existing) => existing.id === action.id)) {
      actions.push(action);
    }
  };

  if (
    normalized.includes('smoke') ||
    normalized.includes('craving') ||
    normalized.includes('urge') ||
    normalized.includes('relapse') ||
    context.cravings.todayCount > 0
  ) {
    addAction({
      id: 'add_recovery_task',
      kind: 'create_planner_task',
      label: 'Add a recovery task',
      description: 'Put one small recovery step into today’s planner.',
      execute: async ({ userId }) =>
        ensurePlannerTask({
          userId,
          title: '10-minute recovery reset',
          category: 'Recovery',
          priority: 'High',
          period: nextPeriod,
          energyLevel: EnergyLevel.LOW,
          fallbackTask: '2 minutes of breathing and water',
        }),
    });

    if (!hasNoSmokingChallenge) {
      addAction({
        id: 'join_no_smoking_challenge',
        kind: 'join_challenge',
        label: 'Join the no-smoking challenge',
        description: 'Start the active recovery challenge from chat.',
        execute: async ({ userId }) => joinChallengeByTitle(userId, '7 Days No Smoking'),
      });
    }
  }

  if (
    normalized.includes('overwhelmed') ||
    normalized.includes('low') ||
    normalized.includes('sad') ||
    normalized.includes('tired') ||
    normalized.includes('stress') ||
    normalized.includes('anxious') ||
    (context.mood.latest.stress != null && context.mood.latest.stress >= 65)
  ) {
    addAction({
      id: 'add_low_energy_task',
      kind: 'create_planner_task',
      label: 'Add a low-energy task',
      description: 'Create one lighter next step in your planner.',
      execute: async ({ userId }) =>
        ensurePlannerTask({
          userId,
          title: '5-minute reset and restart',
          category: 'Recovery',
          priority: 'High',
          period: nextPeriod,
          energyLevel: EnergyLevel.LOW,
          fallbackTask: 'Drink water and choose one next step',
        }),
    });

    addAction({
      id: 'enable_sleep_reminder',
      kind: 'upsert_reminder',
      label: 'Turn on a sleep reminder',
      description: 'Set a gentle wind-down reminder for tonight.',
      execute: async ({ userId }) =>
        upsertReminder({
          userId,
          type: 'sleep',
          title: 'Sleep wind-down',
          message: 'Lower the pressure on the night and start winding down.',
          time: '22:00',
        }),
    });
  }

  if (
    normalized.includes('plan') ||
    normalized.includes('focus') ||
    normalized.includes('productiv') ||
    normalized.includes('discipline') ||
    normalized.includes('task')
  ) {
    addAction({
      id: 'add_focus_task',
      kind: 'create_planner_task',
      label: 'Add one focus block',
      description: 'Create one realistic priority block for today.',
      execute: async ({ userId }) =>
        ensurePlannerTask({
          userId,
          title: '15-minute focus block',
          category: 'Focus',
          priority: 'High',
          period: nextPeriod,
          energyLevel: EnergyLevel.MEDIUM,
          fallbackTask: 'Work on it for 5 minutes only',
        }),
    });
  }

  if (!hasMoodChallenge && (context.mood.current == null || normalized.includes('mood') || normalized.includes('feel'))) {
    addAction({
      id: 'join_mood_challenge',
      kind: 'join_challenge',
      label: 'Join the mood check-in challenge',
      description: 'Start a short challenge that builds emotional consistency.',
      execute: async ({ userId }) => joinChallengeByTitle(userId, '7 Day Mood Check-In'),
    });
  }

  if (actions.length < 2) {
    addAction({
      id: 'enable_journal_reminder',
      kind: 'upsert_reminder',
      label: 'Turn on a journal reminder',
      description: 'Set a nightly reflection prompt you can actually keep.',
      execute: async ({ userId }) =>
        upsertReminder({
          userId,
          type: 'journal',
          title: 'Evening reflection',
          message: 'Write one honest paragraph before you end the day.',
          time: '20:30',
        }),
    });
  }

  return actions.slice(0, 2);
}

function buildCoachInstructions(context: AIContext) {
  const friendlyName = getFriendlyName(context);

  return [
    'You are RiseUp Coach, a smart, emotionally aware Gemini-powered AI companion inside a self-improvement app.',
    'Act like a real high-quality general AI assistant, not a narrow scripted bot.',
    'You can help with general questions, explanations, brainstorming, motivation, productivity, life advice, and app-aware self-improvement coaching.',
    "If the user's question goes beyond the app context, still answer it helpfully and fully like a strong general AI assistant, then connect it back to their situation only if that adds value.",
    'Sound natural, grounded, warm, supportive, and sharp. You should feel like a close trusted friend, not a robotic wellness app.',
    `The user's friendly name is ${friendlyName}. You may use their first name or username naturally once in a while. You may use casual language like "bro" sparingly when it feels natural, but never force slang into every reply.`,
    'Avoid robotic filler like "based on your context", "as an AI", or repetitive therapist-sounding phrases.',
    "Answer the user's actual question first, then use the app context only where it genuinely helps.",
    "Use the user's current state, recent habits, cravings, planner, and mood to make the reply feel personally aware without sounding creepy or over-referencing data.",
    'Prefer one clear recommendation plus one smaller backup version when the user seems overwhelmed or low-energy.',
    'If the user wants motivation, inspiration, a pep talk, or feels stuck, give practical encouragement plus a short relatable story, comeback example, metaphor, or perspective shift.',
    `When useful, draw from themes like: ${MOTIVATION_REFERENCE_THEMES.join('; ')}.`,
    'If the message is about cravings, relapse risk, nicotine, smoking, or urges: stay calm, suggest a short delay, one replacement action, and a concrete next 10-minute plan.',
    'If the message is about low mood, stress, anxiety, or exhaustion: lower the pressure, help the user stabilize first, and keep the next step small and realistic.',
    'If the message is about discipline, productivity, planning, or focus: help the user pick one priority, one backup version, and avoid perfectionism.',
    'If the user missed habits, do not tell them to catch up on everything. Help them restart with the minimum useful step.',
    'Do not shame the user, do not diagnose, do not make medical claims, and do not give dangerous advice.',
    'If the user seems highly distressed, prioritize safety, human support, and immediate grounding.',
    'Reply in 3 to 7 sentences by default. If the user asks for depth, examples, a story, or explanation, you can go longer.',
    'Use plain text only. No markdown bullets, no roleplay labels, and no quotation marks unless needed.',
  ].join('\n');
}

function buildContextSummary(context: AIContext) {
  const pendingTask = context.planner.pendingTasks[0]
    ? `${context.planner.pendingTasks[0].title} (${context.planner.pendingTasks[0].period})`
    : 'none';

  const activeChallenges =
    context.challenges.active.length > 0
      ? context.challenges.active.map((challenge) => challenge.title).join(', ')
      : 'none';

  const plannerCompletion =
    context.planner.totalCount === 0 ? 'no planner items yet' : `${context.planner.completedCount}/${context.planner.totalCount}`;

  return [
    `User identity: ${context.identity.fullName ?? context.identity.username ?? 'unknown'}`,
    `Preferred coach style: ${context.coachStyle ?? 'balanced'}`,
    `Latest mood: ${context.mood.latest.label ?? 'unknown'}`,
    `Mood direction: ${context.mood.direction}`,
    `Energy: ${context.mood.latest.energy ?? 'unknown'}/10`,
    `Stress: ${context.mood.latest.stress ?? 'unknown'}/10`,
    `Motivation: ${context.mood.latest.motivation ?? 'unknown'}/10`,
    `Focus: ${context.mood.latest.focus ?? 'unknown'}/10`,
    `Habits completed today: ${context.habits.completedToday}/${context.habits.total}`,
    `Habit streak: ${context.habits.streakDays} days`,
    `Active habits: ${context.habits.activeNames.join(', ') || 'none'}`,
    `Cravings today: ${context.cravings.todayCount}`,
    `Craving resistance rate: ${context.cravings.resistanceRate}%`,
    `Top craving trigger: ${context.cravings.topTrigger ?? 'none logged'}`,
    `Current quit-support streak: ${context.quitSupport.currentStreak} days`,
    `Planner mode: ${context.planner.mode}`,
    `Planner completion today: ${plannerCompletion}`,
    `Next pending task: ${pendingTask}`,
    `Active challenges: ${activeChallenges}`,
  ].join('\n');
}

function buildOpenAIInput(params: {
  message: string;
  context: AIContext;
  history: CoachChatMessage[];
}) {
  const historyText = params.history
    .slice(-8)
    .map((entry) => `${entry.role === 'user' ? 'User' : 'Coach'}: ${entry.content}`)
    .join('\n\n');

  return [
    historyText ? `Recent conversation:\n${historyText}` : '',
    `Current user message:\n${params.message}`,
    `App context:\n${buildContextSummary(params.context)}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildGeminiContents(params: {
  message: string;
  context: AIContext;
  history: CoachChatMessage[];
}) {
  const recentHistory = params.history.slice(-8);
  const contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }> = [];

  if (recentHistory.length > 0) {
    for (const entry of recentHistory) {
      contents.push({
        role: entry.role === 'user' ? 'user' : 'model',
        parts: [{ text: entry.content }],
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [
      {
        text: [`Current user message:\n${params.message}`, `App context:\n${buildContextSummary(params.context)}`].join('\n\n'),
      },
    ],
  });

  return contents;
}

function extractOpenAIResponseText(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  if ('output_text' in payload && typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  if (!('output' in payload) || !Array.isArray(payload.output)) {
    return null;
  }

  for (const outputItem of payload.output) {
    if (typeof outputItem !== 'object' || outputItem === null || !('content' in outputItem) || !Array.isArray(outputItem.content)) {
      continue;
    }

    const textParts = outputItem.content
      .map((contentItem: unknown) => {
        if (
          typeof contentItem === 'object' &&
          contentItem !== null &&
          'type' in contentItem &&
          contentItem.type === 'output_text' &&
          'text' in contentItem &&
          typeof contentItem.text === 'string'
        ) {
          return contentItem.text.trim();
        }

        return '';
      })
      .filter(Boolean);

    if (textParts.length > 0) {
      return textParts.join('\n').trim();
    }
  }

  return null;
}

function extractGeminiResponseText(payload: unknown) {
  if (typeof payload !== 'object' || payload === null || !('candidates' in payload) || !Array.isArray(payload.candidates)) {
    return null;
  }

  for (const candidate of payload.candidates) {
    if (
      typeof candidate !== 'object' ||
      candidate === null ||
      !('content' in candidate) ||
      typeof candidate.content !== 'object' ||
      candidate.content === null ||
      !('parts' in candidate.content) ||
      !Array.isArray(candidate.content.parts)
    ) {
      continue;
    }

    const text = candidate.content.parts
      .map((part: unknown) => {
        if (typeof part === 'object' && part !== null && 'text' in part && typeof part.text === 'string') {
          return part.text.trim();
        }

        return '';
      })
      .filter(Boolean)
      .join('\n')
      .trim();

    if (text) {
      return text;
    }
  }

  return null;
}

async function generateOpenAIReply(params: {
  message: string;
  context: AIContext;
  history: CoachChatMessage[];
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY ?? ''}`,
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        instructions: buildCoachInstructions(params.context),
        input: buildOpenAIInput(params),
        max_output_tokens: 420,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`OpenAI request failed (${response.status}): ${details}`);
    }

    const payload = (await response.json()) as unknown;
    const reply = extractOpenAIResponseText(payload);

    if (!reply) {
      throw new Error('OpenAI response did not include output text');
    }

    return reply;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateGeminiReply(params: {
  message: string;
  context: AIContext;
  history: CoachChatMessage[];
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY ?? ''}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildCoachInstructions(params.context) }],
          },
          contents: buildGeminiContents(params),
          generationConfig: {
            maxOutputTokens: 420,
            temperature: 0.9,
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Gemini request failed (${response.status}): ${details}`);
    }

    const payload = (await response.json()) as unknown;
    const reply = extractGeminiResponseText(payload);

    if (!reply) {
      throw new Error('Gemini response did not include output text');
    }

    return reply;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateCoachReply(params: {
  message: string;
  context: AIContext;
  history: CoachChatMessage[];
}) {
  if (detectHighRiskDistress(params.message)) {
    return {
      reply: buildCrisisSupportReply(),
      provider: 'local' as const,
    };
  }

  const provider = getPreferredAIProvider();
  const hasRemoteProvider = provider === 'openai' ? Boolean(env.OPENAI_API_KEY) : Boolean(env.GEMINI_API_KEY);

  if (!hasRemoteProvider) {
    return {
      reply: buildFallbackCoachReply(params),
      provider: 'local' as const,
    };
  }

  try {
    const reply = provider === 'openai' ? await generateOpenAIReply(params) : await generateGeminiReply(params);

    return {
      reply,
      provider,
    };
  } catch (error) {
    console.error(`${provider} coach request failed`, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      reply: buildFallbackCoachReply(params),
      provider: 'local' as const,
    };
  }
}

export async function buildAIContext(userId: string): Promise<AIContext> {
  const todayKey = getDateKey();
  const { start: weekStart } = getDateRange(7);

  const [user, profile, habits, todayHabitLogs, recentHabitLogs, recentMoods, recentCravings, todayPlan, quitProfile, activeChallenges] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          fullName: true,
          username: true,
        },
      }),
      prisma.userProfile.findUnique({
        where: { userId },
        select: { aiStyle: true },
      }),
      prisma.habit.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true },
      }),
      prisma.habitLog.findMany({
        where: { userId, dateKey: todayKey, completed: true },
        select: { habitId: true },
      }),
      prisma.habitLog.findMany({
        where: { userId, completed: true },
        orderBy: { dateKey: 'desc' },
        take: 60,
        select: { dateKey: true },
      }),
      prisma.moodLog.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 7,
        select: {
          moodLabel: true,
          energy: true,
          stress: true,
          motivation: true,
          focus: true,
          date: true,
        },
      }),
      prisma.cravingLog.findMany({
        where: { userId },
        orderBy: { occurredAt: 'desc' },
        take: 12,
        select: {
          trigger: true,
          intensity: true,
          outcome: true,
          occurredAt: true,
        },
      }),
      prisma.dailyPlan.findUnique({
        where: {
          userId_dateKey: {
            userId,
            dateKey: todayKey,
          },
        },
        include: {
          items: {
            orderBy: [{ period: 'asc' }, { scheduledTime: 'asc' }],
            select: {
              title: true,
              status: true,
              period: true,
            },
          },
        },
      }),
      prisma.quitProfile.findUnique({
        where: { userId },
      }),
      prisma.challengeParticipant.findMany({
        where: {
          userId,
          status: 'ACTIVE',
        },
        orderBy: { joinedAt: 'asc' },
        take: 3,
        include: {
          challenge: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ]);

  const currentMoodEntry = recentMoods[0] ?? null;
  const todayCravings = recentCravings.filter((entry) => getDateKey(entry.occurredAt) === todayKey);
  const resistedCravingsThisWeek = recentCravings.filter(
    (entry) => entry.outcome === CravingOutcome.RESISTED && entry.occurredAt >= weekStart,
  ).length;
  const completedHabitIds = new Set(todayHabitLogs.map((log) => log.habitId));
  const pendingTasks = (todayPlan?.items ?? [])
    .filter((item) => item.status === TaskStatus.PENDING)
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      period: formatPlannerPeriod(item.period),
    }));

  const moodSignals = recentMoods.map((entry) => {
    const energy = entry.energy ?? 50;
    const stress = 100 - (entry.stress ?? 50);
    const motivation = entry.motivation ?? 50;
    const focus = entry.focus ?? 50;

    return (energy + stress + motivation + focus) / 4;
  });

  const midpoint = Math.floor(moodSignals.length / 2);
  const moodDirection =
    moodSignals.length < 4
      ? 'steady'
      : average(moodSignals.slice(0, midpoint)) < average(moodSignals.slice(midpoint))
        ? 'improving'
        : average(moodSignals.slice(0, midpoint)) > average(moodSignals.slice(midpoint))
          ? 'dipping'
          : 'steady';
  const firstName = user.fullName.trim().split(/\s+/)[0] ?? null;

  return {
    identity: {
      fullName: user.fullName,
      firstName,
      username: user.username,
    },
    coachStyle: profile?.aiStyle ?? null,
    habits: {
      total: habits.length,
      completedToday: completedHabitIds.size,
      streakDays: calculateDateKeyStreak(recentHabitLogs.map((log) => log.dateKey)),
      activeNames: habits.slice(0, 5).map((habit) => habit.name),
    },
    mood: {
      current: currentMoodEntry ? formatMoodLabel(currentMoodEntry.moodLabel) : null,
      latest: {
        label: currentMoodEntry ? formatMoodLabel(currentMoodEntry.moodLabel) : null,
        stress: currentMoodEntry?.stress ?? null,
        motivation: currentMoodEntry?.motivation ?? null,
        focus: currentMoodEntry?.focus ?? null,
        energy: currentMoodEntry?.energy ?? null,
        timestamp: currentMoodEntry?.date.toISOString() ?? null,
      },
      recentHistory: recentMoods.map((entry) => ({
        label: formatMoodLabel(entry.moodLabel),
        timestamp: entry.date.toISOString(),
      })),
      direction: moodDirection,
    },
    cravings: {
      todayCount: todayCravings.length,
      topTrigger: getTopTrigger(recentCravings.map((entry) => entry.trigger)),
      resistanceRate:
        recentCravings.length === 0 ? 0 : Math.round((resistedCravingsThisWeek / recentCravings.length) * 100),
      recent: recentCravings.slice(0, 5).map((entry) => ({
        trigger: entry.trigger,
        intensity: entry.intensity,
        outcome: entry.outcome.toLowerCase(),
        timestamp: entry.occurredAt.toISOString(),
      })),
    },
    quitSupport: {
      currentStreak: getCurrentQuitStreakDays(quitProfile),
    },
    planner: {
      mode: todayPlan ? formatPlannerMode(todayPlan.mode) : 'normal',
      pendingTasks,
      completedCount: (todayPlan?.items ?? []).filter((item) => item.status === TaskStatus.COMPLETED).length,
      totalCount: todayPlan?.items.length ?? 0,
    },
    challenges: {
      active: activeChallenges.map((challenge) => ({
        id: challenge.challenge.id,
        title: challenge.challenge.title,
        progressPercentage: challenge.completionPercentageSnapshot,
        completionStatus: challenge.status.toLowerCase(),
      })),
    },
  };
}

export async function getCoachConversationState(userId: string, conversationId?: string) {
  const [context, conversation] = await Promise.all([buildAIContext(userId), getCurrentConversation(userId, conversationId)]);
  const messages = await getConversationMessages(conversation.id);

  return {
    conversationId: conversation.id,
    messages,
    context,
    provider: getConversationProvider(messages),
  };
}

export async function resetCoachConversation(userId: string) {
  await prisma.coachConversation.updateMany({
    where: {
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  const conversation = await prisma.coachConversation.create({
    data: {
      userId,
      title: 'New coaching chat',
      isActive: true,
    },
  });

  const context = await buildAIContext(userId);

  return {
    conversationId: conversation.id,
    messages: [] as CoachChatMessage[],
    context,
    provider: 'local' as const,
  };
}

export async function chatWithCoach(userId: string, message: string, conversationId?: string) {
  const [context, conversation] = await Promise.all([buildAIContext(userId), getCurrentConversation(userId, conversationId)]);
  const history = await getConversationMessages(conversation.id);
  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
  const result = await generateCoachReply({
    message,
    context,
    history: recentHistory,
  });
  const suggestedActions = buildSuggestedActions({ message, context }).map(({ id, kind, label, description }) => ({
    id,
    kind,
    label,
    description,
  }));

  await prisma.$transaction(async (transaction) => {
    await transaction.coachConversation.updateMany({
      where: {
        userId,
        isActive: true,
        id: {
          not: conversation.id,
        },
      },
      data: {
        isActive: false,
      },
    });

    await transaction.coachConversation.update({
      where: { id: conversation.id },
      data: {
        isActive: true,
        title: conversation.title ?? buildConversationTitle(message),
        updatedAt: new Date(),
      },
    });

    await transaction.coachMessage.create({
      data: {
        conversationId: conversation.id,
        role: CoachMessageRole.USER,
        content: message,
      },
    });

    await transaction.coachMessage.create({
      data: {
        conversationId: conversation.id,
        role: CoachMessageRole.ASSISTANT,
        // Keep the persisted enum backward-compatible while treating GEMINI as the generic remote AI bucket.
        provider: result.provider === 'local' ? PrismaCoachProvider.LOCAL : PrismaCoachProvider.GEMINI,
        content: result.reply,
      },
    });
  });

  const messages = await getConversationMessages(conversation.id);

  return {
    reply: result.reply,
    context,
    provider: result.provider,
    conversationId: conversation.id,
    messages,
    suggestedActions,
  };
}

export async function executeCoachAction(userId: string, actionId: string, conversationId?: string) {
  const [context, conversation] = await Promise.all([buildAIContext(userId), getCurrentConversation(userId, conversationId)]);
  const recentStoredMessages = await prisma.coachMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'desc' },
    take: MAX_HISTORY_MESSAGES,
  });
  const latestUserMessage = recentStoredMessages.find((message) => message.role === CoachMessageRole.USER)?.content ?? '';
  const actions = buildSuggestedActions({ message: latestUserMessage, context });
  const selectedAction = actions.find((action) => action.id === actionId);

  if (!selectedAction) {
    throw new Error('That suggested action is no longer available.');
  }

  const confirmation = await selectedAction.execute({ userId });

  await prisma.$transaction(async (transaction) => {
    await transaction.coachConversation.update({
      where: { id: conversation.id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });

    await transaction.coachMessage.create({
      data: {
        conversationId: conversation.id,
        role: CoachMessageRole.ASSISTANT,
        provider: PrismaCoachProvider.LOCAL,
        content: confirmation,
      },
    });
  });

  const nextContext = await buildAIContext(userId);
  const nextMessages = await getConversationMessages(conversation.id);
  const nextSuggestions = buildSuggestedActions({ message: latestUserMessage, context: nextContext })
    .filter((action) => action.id !== actionId)
    .map(({ id, kind, label, description }) => ({
      id,
      kind,
      label,
      description,
    }));

  return {
    reply: confirmation,
    context: nextContext,
    provider: 'local' as const,
    conversationId: conversation.id,
    messages: nextMessages,
    executedActionId: actionId,
    suggestedActions: nextSuggestions,
  };
}
