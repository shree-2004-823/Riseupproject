export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  username?: string | null;
  phoneNumber?: string | null;
  phoneVerified?: boolean;
  role: string;
  onboardingCompleted: boolean;
}

export interface UserProfile {
  goals: string[];
  coachPersonality?: string | null;
  routine: {
    wakeTime?: string | null;
    workoutTime?: string | null;
    reminderTime?: string | null;
    sleepTime?: string | null;
  };
}

export interface AuthResponse {
  message: string;
  user: SessionUser;
}

export interface MeResponse {
  user: SessionUser;
  profile: UserProfile | null;
}

export interface ProfileResponse {
  profile: {
    fullName: string;
    email: string;
    createdAt: string;
    goals: string[];
    coachPersonality: string;
    routine: {
      wakeTime: string;
      sleepTime: string;
      workoutTime: string;
      reminderTime: string;
    };
  };
  stats: {
    currentStreak: number;
    longestStreak: number;
    totalHabits: number;
    weekCompletionRate: number;
    moodCheckInStreak: number;
  };
}

export interface SettingsResponse {
  settings: {
    coachPersonality: string;
    routine: {
      wakeTime: string;
      sleepTime: string;
      workoutTime: string;
      reminderTime: string;
    };
    reminderSettings: Array<{
      type: ReminderType;
      title: string;
      enabled: boolean;
      time: string;
    }>;
  };
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  frequency: string;
  time?: string | null;
  completed: boolean;
  streak: number;
  fallbackTask?: string | null;
  isActive: boolean;
}

export interface HabitsResponse {
  habits: Habit[];
  stats: {
    completedCount: number;
    totalCount: number;
    completionPercentage: number;
    longestStreak: number;
    activeCount: number;
    weekRate: number;
  };
  week: Array<{
    label: string;
    completed: boolean;
  }>;
}

export interface MoodEntry {
  id: string;
  moodLabel: string;
  energy?: number | null;
  stress?: number | null;
  confidence?: number | null;
  anxiety?: number | null;
  motivation?: number | null;
  focus?: number | null;
  note?: string | null;
  date: string;
}

export interface MoodHistoryResponse {
  entries: MoodEntry[];
  trend: Array<{
    day: string;
    mood: number;
  }>;
  summary: {
    mostCommonMood: string;
    checkInStreak: number;
    averageEnergyLabel: string;
    patterns: string[];
  };
}

export interface MoodSaveResponse {
  entry: MoodEntry;
  aiResponse: string;
}

export interface CravingLog {
  id: string;
  habitType: string;
  trigger?: string | null;
  intensity?: number | null;
  outcome: string;
  notes?: string | null;
  occurredAt: string;
}

export interface QuitSupportResponse {
  currentSmokeFreeStreak: number;
  longestSmokeFreeStreak?: number;
  cravingsToday: number;
  urgesResistedToday: number;
  moneySaved: number;
  topTrigger?: string | null;
  reasonsToQuit?: string[];
  quitStartedAt?: string | null;
  supportUses?: number;
  recentLogs: CravingLog[];
}

export interface PlannerItem {
  id: string;
  title: string;
  time?: string | null;
  category?: string | null;
  priority?: string | null;
  fallbackTask?: string | null;
  energyLevel: string;
  status: string;
  completed: boolean;
}

export interface PlannerResponse {
  dateKey: string;
  mode: string;
  itemsByPeriod: Record<'morning' | 'afternoon' | 'evening' | 'night', PlannerItem[]>;
  totals: {
    completedCount: number;
    totalCount: number;
  };
  aiInsight: string;
}

export interface DashboardResponse {
  user: SessionUser;
  profile: {
    coachPersonality?: string | null;
    goals: string[];
  };
  greeting: string;
  dateLabel: string;
  streakDays: number;
  focusSentence: string;
  quote: {
    id: string;
    content: string;
    author?: string | null;
    category: string;
    nextRefreshInSeconds: number;
  } | null;
  goals: Array<{
    id: string;
    label: string;
    done: boolean;
  }>;
  habits: {
    completedCount: number;
    totalCount: number;
    completionPercentage: number;
    remainingCount: number;
  };
  mood: {
    label: string;
    emoji: string;
    energyLabel: string;
    stressLabel: string;
    focusLabel: string;
    checkedInAt: string;
  } | null;
  quitSupport: {
    smokeFreeDays: number;
    cravingsToday: number;
    topTrigger?: string | null;
    recentOutcomes: Array<{
      id: string;
      outcome: string;
      trigger?: string | null;
      intensity?: number | null;
      occurredAt: string;
    }>;
  };
  planner: {
    mode: string;
    completedCount: number;
    totalCount: number;
    upcomingTasks: Array<{
      id: string;
      title: string;
      period: string;
      status: string;
      time?: string | null;
      energyLevel: string;
    }>;
  };
  stats: {
    moodCheckIns: number;
    journalEntries: number;
    resistedCravings: number;
    plannerCompletion: number;
    strongestHabitCategory: string;
    currentMood: string;
    habitDifficultyMix: string;
  };
  insights: Array<{
    id: string;
    category: 'mood_habits' | 'cravings' | 'productivity';
    tone: 'success' | 'info' | 'warning';
    title: string;
    summary: string;
    metric: string;
    confidence: 'emerging' | 'medium' | 'high';
  }>;
  alerts: Array<{
    id: string;
    tone: string;
    message: string;
  }>;
  week: Array<{
    label: string;
    completed: boolean;
  }>;
}

export interface AdminMetricsResponse {
  stats: {
    totalUsers: number;
    activeToday: number;
    onboardedUsers: number;
    admins: number;
    newUsersThisWeek: number;
    habitCompletionsToday: number;
    moodCheckInsToday: number;
    cravingLogsToday: number;
    relapseEventsToday: number;
    remindersSentToday: number;
    remindersActedOnToday: number;
  };
  recentActivity: Array<{
    id: string;
    actor: string;
    action: string;
    email: string;
    at: string;
  }>;
}

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  username?: string | null;
  role: string;
  onboardingCompleted: boolean;
  createdAt: string;
  stats: {
    habits: number;
    moodLogs: number;
    cravingLogs: number;
    dailyPlans: number;
    journalEntries: number;
  };
}

export interface AdminUsersResponse {
  users: AdminUserListItem[];
}

export interface AdminQuoteListItem {
  id: string;
  content: string;
  author?: string | null;
  category: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminQuotesResponse {
  quotes: AdminQuoteListItem[];
}

export interface AdminAuditLogItem {
  id: string;
  action: string;
  status: string;
  details?: string | null;
  createdAt: string;
  admin: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export interface AdminAuditResponse {
  logs: AdminAuditLogItem[];
}

export interface JournalEntry {
  id: string;
  title?: string | null;
  content: string;
  emotionTag?: string | null;
  createdAt: string;
}

export interface JournalResponse {
  entries: JournalEntry[];
}

export interface JournalSaveResponse {
  entry: JournalEntry;
}

export interface ProgressResponse {
  range?: string;
  stats: Array<{
    label: string;
    value: string;
    tone: 'orange' | 'blue' | 'emerald' | 'violet';
    note?: string;
  }>;
  habitTrend: Array<{
    day: string;
    completed: number;
    target: number;
    completionRate: number;
  }>;
  moodTrend: Array<{
    day: string;
    mood: number | null;
  }>;
  cravingTrend: Array<{
    day: string;
    cravings: number;
    resisted: number;
    relapsed: number;
  }>;
  streaks: {
    currentHabitStreak: number;
    longestHabitStreak: number;
    moodCheckInStreak: number;
  };
  summary: {
    currentStreak?: number;
    habitsCompletedThisWeek?: number;
    averageMoodLabel?: string | null;
    habitCompletionRate: number;
    totalHabits: number;
    completedHabitLogs: number;
    plannerCompletionRate: number;
    averageMoodScore: number | null;
    smokeFreeDays?: number;
    longestSmokeFreeStreak?: number;
    workoutsCompleted?: number;
    consistencyScore?: number;
    recoveryRate?: number;
    moodDirection: string;
    strongestMood: string | null;
    resistedCravings: number;
    totalCravings: number;
    cravingResistanceRate: number;
    topTrigger: string | null;
    topTimeWindow: string | null;
    averageCravingIntensity: number | null;
    reminderEffectivenessRate?: number;
  };
  cravingTriggerCounts: Array<{
    label: string;
    count: number;
  }>;
  cravingTimePattern: Array<{
    label: string;
    count: number;
  }>;
  habitScores: {
    strongest: Array<{
      id: string;
      name: string;
      completionRate: number;
      completedDays: number;
      targetDays: number;
      currentStreak: number;
    }>;
    weakest: Array<{
      id: string;
      name: string;
      completionRate: number;
      completedDays: number;
      targetDays: number;
      currentStreak: number;
    }>;
  };
  habitAnalytics?: {
    activeHabits: number;
    completionRate: number;
    strongestHabit: string | null;
    weakestHabit: string | null;
    mostMissedHabit: string | null;
    dailyTrend: Array<{
      day: string;
      completed: number;
      target: number;
      completionRate: number;
    }>;
  };
  moodAnalytics?: {
    mostCommonMood: string | null;
    averageEnergy: number | null;
    averageStress: number | null;
    averageMotivation: number | null;
    recentSummary: string;
    trend: Array<{
      date: string;
      moodLabel: string;
      energy: number | null;
      stress: number | null;
      motivation: number | null;
    }>;
  };
  quitSupportAnalytics?: {
    totalCravings: number;
    resistedCount: number;
    notResistedCount: number;
    smokeFreeDays: number;
    longestSmokeFreeStreak?: number;
    mostCommonTrigger: string | null;
    triggerCounts: Array<{
      label: string;
      count: number;
    }>;
    timeBuckets: Array<{
      bucket: string;
      count: number;
    }>;
    comebackSummary: string;
  };
  plannerAnalytics?: {
    completionRate: number;
    mostSkippedBlock: string | null;
    mostCompletedBlock: string | null;
    pendingTasks: number;
    carryForwardCount?: number;
    completedAfterRolloverCount?: number;
  };
  reminderAnalytics?: {
    sentCount: number;
    missedCount: number;
    actedOnCount: number;
    effectivenessRate: number;
  };
  weeklyReview?: {
    bestDay: string | null;
    hardestDay: string | null;
    biggestWin: string;
    biggestStruggle: string;
    nextFocus: string;
  };
  insights: Array<{
    tone: 'emerald' | 'blue' | 'yellow' | 'violet';
    title: string;
    message: string;
  }>;
}

export interface AIContext {
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
}

export interface AIConversationMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  createdAt: string;
  provider: 'openai' | 'gemini' | 'local' | null;
}

export interface AIAgentAction {
  id: string;
  kind: 'create_planner_task' | 'upsert_reminder' | 'join_challenge';
  label: string;
  description: string;
}

export interface AIConversationStateResponse {
  conversationId: string;
  messages: AIConversationMessage[];
  provider: 'openai' | 'gemini' | 'local';
  context: AIContext;
}

export interface AIChatResponse extends AIConversationStateResponse {
  message: string;
  suggestedActions: AIAgentAction[];
}

export interface AIActionResponse extends AIConversationStateResponse {
  message: string;
  executedActionId: string;
  suggestedActions: AIAgentAction[];
}

export type ReminderType =
  | 'workout'
  | 'hydration'
  | 'mood-check'
  | 'journal'
  | 'quit-support'
  | 'sleep';

export interface ReminderSchedule {
  id: string;
  type: ReminderType;
  title: string;
  message?: string | null;
  time: string;
  enabled: boolean;
  habitId?: string | null;
  habitName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReminder {
  id: string;
  scheduleId: string;
  type: ReminderType | 'habit';
  status: 'due' | 'missed' | 'upcoming';
  title: string;
  message: string;
  time: string;
}

export interface RemindersResponse {
  schedules: ReminderSchedule[];
  generated: GeneratedReminder[];
  availableHabits: Array<{
    id: string;
    name: string;
  }>;
  summary: {
    enabledCount: number;
    missedCount: number;
    dueCount: number;
  };
}

export interface ChallengeListItem {
  id: string;
  title: string;
  description: string;
  type: 'no_smoking' | 'workout' | 'hydration' | 'mood_checkin' | 'journal' | 'recovery';
  difficulty: 'easy' | 'medium' | 'hard';
  joined: boolean;
  joinedAt?: string;
  progressPercentage: number;
  daysCompleted: number;
  durationDays: number;
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'expired';
  rewardBadgeText?: string | null;
  timeLabel: string;
}

export interface ChallengesResponse {
  challenges: ChallengeListItem[];
}

export interface JoinChallengeResponse {
  challenge: ChallengeListItem;
}

export interface CommunityResponse {
  summary: {
    totalMembers: number;
    activeToday: number;
    habitWinsToday: number;
    moodCheckInsToday: number;
    resistedCravingsToday: number;
    journalEntriesToday: number;
  };
  spotlightChallenges: Array<{
    id: string;
    title: string;
    description: string;
    type: ChallengeListItem['type'];
    difficulty: ChallengeListItem['difficulty'];
    activeParticipants: number;
    completedParticipants: number;
  }>;
  personalMomentum: {
    joinedCount: number;
    activeCount: number;
    completedCount: number;
    bestChallengeTitle: string | null;
    bestProgressPercentage: number;
  };
  supportPrinciples: string[];
}
