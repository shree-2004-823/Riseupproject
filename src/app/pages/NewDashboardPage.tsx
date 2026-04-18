import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/ui/StatCard';
import { InsightCard } from '../components/ui/InsightCard';
import {
  Target,
  Heart,
  Ban,
  Calendar,
  BookOpen,
  Zap,
  TrendingUp,
  AlertCircle,
  Sparkles,
  CheckCircle,
  Clock,
  Quote,
  Brain,
} from 'lucide-react';
import { Link } from 'react-router';
import { apiFetch, ApiError } from '@/lib/api';
import type { DashboardResponse } from '@/lib/types';

const insightToneStyles: Record<'success' | 'info' | 'warning', string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
};

const insightCategoryLabels: Record<'mood_habits' | 'cravings' | 'productivity', string> = {
  mood_habits: 'Mood vs habits',
  cravings: 'Craving pattern',
  productivity: 'Productivity pattern',
};

const insightIcons = {
  mood_habits: Heart,
  cravings: AlertCircle,
  productivity: TrendingUp,
} as const;

export function NewDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const response = await apiFetch<DashboardResponse>('/dashboard');
      setDashboard(response);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to load your dashboard right now');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/30 via-violet-900/20 to-emerald-900/20 border border-white/10 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10 opacity-50"></div>
          <div className="relative">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles size={24} className="text-yellow-400 animate-pulse" />
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {dashboard?.greeting ?? 'Welcome back'},{' '}
                    {dashboard?.user.fullName.split(' ')[0] ?? 'there'}
                  </h1>
                </div>
                <p className="text-white/70 text-lg mb-1">
                  {dashboard?.dateLabel ?? "Loading today's overview..."}
                </p>
                <p className="text-white/60 text-sm max-w-2xl leading-relaxed bg-white/5 px-4 py-2 rounded-lg inline-block">
                  <span className="text-emerald-400 font-semibold">Today's Focus:</span>{' '}
                  {dashboard?.focusSentence ?? 'Gathering your progress signals...'}
                </p>
                {dashboard?.quote && (
                  <div className="max-w-2xl rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-2 text-blue-300 mb-2">
                      <Quote size={16} />
                      <span className="text-xs uppercase tracking-[0.2em]">{dashboard.quote.category}</span>
                    </div>
                    <p className="text-white/85 italic">"{dashboard.quote.content}"</p>
                    <p className="text-white/50 text-sm mt-2">- {dashboard.quote.author ?? 'Unknown'}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-white/60 text-sm">Current Streak</p>
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                    {loading ? '--' : dashboard?.streakDays ?? 0}
                  </p>
                  <p className="text-white/60 text-xs">days</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InsightCard title="Today's Goals" icon={Target} action={{ label: 'View All', onClick: () => {} }}>
            <div className="space-y-3">
              {(dashboard?.goals ?? []).map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      goal.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
                    }`}
                  >
                    {goal.done && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <span className={`text-sm ${goal.done ? 'text-white/60 line-through' : 'text-white'}`}>
                    {goal.label}
                  </span>
                </div>
              ))}
            </div>
          </InsightCard>

          <InsightCard title="Habit Progress" icon={Target}>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">
                    {dashboard?.habits.completedCount ?? 0}/{dashboard?.habits.totalCount ?? 0}
                  </span>
                  <span className="text-sm text-white/60">completed</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dashboard?.habits.completionPercentage ?? 0}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                  />
                </div>
              </div>
              <p className="text-white/60 text-sm">
                <span className="text-blue-400 font-semibold">
                  {dashboard?.habits.remainingCount ?? 0} habits
                </span>{' '}
                left today
              </p>
              <Link
                to="/habits"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-violet-500/20 hover:from-blue-500/30 hover:to-violet-500/30 border border-blue-500/30 rounded-lg transition-colors text-sm"
              >
                <span>Mark Habits</span>
              </Link>
            </div>
          </InsightCard>

          <InsightCard title="Mood Snapshot" icon={Heart}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl">
                  {dashboard?.mood?.emoji ?? '✨'}
                </div>
                <div>
                  <p className="font-semibold text-lg capitalize">
                    {dashboard?.mood?.label ?? 'No check-in yet'}
                  </p>
                  <p className="text-white/60 text-sm">
                    {dashboard?.mood?.checkedInAt
                      ? new Date(dashboard.mood.checkedInAt).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : 'Add your first check-in'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-white/60 text-xs mb-1">Energy</p>
                  <p className="font-semibold text-emerald-400">{dashboard?.mood?.energyLabel ?? 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Stress</p>
                  <p className="font-semibold text-yellow-400">{dashboard?.mood?.stressLabel ?? 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Focus</p>
                  <p className="font-semibold text-blue-400">{dashboard?.mood?.focusLabel ?? 'Unknown'}</p>
                </div>
              </div>
              <Link
                to="/mood"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 rounded-lg transition-colors text-sm"
              >
                <span>Update Mood</span>
              </Link>
            </div>
          </InsightCard>

          <InsightCard
            title="Quote Rotation"
            icon={Sparkles}
            gradient="bg-gradient-to-br from-violet-900/30 to-purple-900/20"
          >
            <div className="space-y-3">
              <p className="text-white/80 text-sm leading-relaxed">
                {dashboard?.quote?.content ?? 'A fresh quote will appear here as your day moves forward.'}
              </p>
              <div className="flex items-center space-x-2 text-emerald-400 text-sm">
                <TrendingUp size={16} />
                <span>
                  Refreshes every {dashboard?.quote?.nextRefreshInSeconds
                    ? Math.round(dashboard.quote.nextRefreshInSeconds / 60)
                    : 5}{' '}
                  minutes
                </span>
              </div>
            </div>
          </InsightCard>

          <InsightCard
            title="Quit Support"
            icon={Ban}
            gradient="bg-gradient-to-br from-red-900/20 to-orange-900/10"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-xs mb-1">Smoke-Free</p>
                  <p className="text-2xl font-bold text-emerald-400">{dashboard?.quitSupport.smokeFreeDays ?? 0}</p>
                  <p className="text-white/60 text-xs">days</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Cravings Today</p>
                  <p className="text-2xl font-bold text-orange-400">{dashboard?.quitSupport.cravingsToday ?? 0}</p>
                  <p className="text-white/60 text-xs">logged</p>
                </div>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-xs text-orange-300">
                  <span className="font-semibold">Trigger Alert:</span>{' '}
                  {dashboard?.quitSupport.topTrigger ?? 'No dominant trigger yet'}
                </p>
              </div>
              <Link
                to="/quit-support"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/30 rounded-lg transition-colors text-sm"
              >
                <span>View Support</span>
              </Link>
            </div>
          </InsightCard>

          <InsightCard title="Daily Planner" icon={Calendar}>
            <div className="space-y-4">
              <div className="space-y-2">
                {dashboard?.planner.upcomingTasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock size={16} className="text-blue-400" />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <span className="text-xs text-white/40">{task.period}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Zap size={16} className="text-blue-400" />
                <span className="text-sm text-blue-300 capitalize">{dashboard?.planner.mode ?? 'normal'} mode</span>
              </div>
              <Link
                to="/planner"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-violet-500/20 hover:from-blue-500/30 hover:to-violet-500/30 border border-blue-500/30 rounded-lg transition-colors text-sm"
              >
                <span>Open Planner</span>
              </Link>
            </div>
          </InsightCard>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard
            icon={Heart}
            label="Mood Check-Ins"
            value={`${dashboard?.stats.moodCheckIns ?? 0}`}
            subtitle="this week"
            gradient="bg-gradient-to-br from-pink-900/30 to-rose-900/20"
            iconGradient="bg-gradient-to-br from-pink-500 to-rose-500"
          />
          <StatCard
            icon={BookOpen}
            label="Journal"
            value={`${dashboard?.stats.journalEntries ?? 0}`}
            subtitle="entries"
            gradient="bg-gradient-to-br from-amber-900/30 to-yellow-900/20"
            iconGradient="bg-gradient-to-br from-amber-500 to-yellow-500"
          />
          <StatCard
            icon={Ban}
            label="Craving Wins"
            value={`${dashboard?.stats.resistedCravings ?? 0}`}
            subtitle="resisted"
            gradient="bg-gradient-to-br from-red-900/30 to-pink-900/20"
            iconGradient="bg-gradient-to-br from-red-500 to-pink-500"
          />
          <StatCard
            icon={Calendar}
            label="Planner"
            value={`${dashboard?.stats.plannerCompletion ?? 0}%`}
            subtitle="complete"
            gradient="bg-gradient-to-br from-blue-900/30 to-cyan-900/20"
            iconGradient="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Target}
            label="Habit Type"
            value={dashboard?.stats.strongestHabitCategory ?? 'none'}
            gradient="bg-gradient-to-br from-violet-900/30 to-purple-900/20"
            iconGradient="bg-gradient-to-br from-violet-500 to-purple-500"
          />
          <StatCard
            icon={Brain}
            label="Current Mood"
            value={dashboard?.stats.currentMood ?? 'unknown'}
            gradient="bg-gradient-to-br from-emerald-900/30 to-green-900/20"
            iconGradient="bg-gradient-to-br from-emerald-500 to-green-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Difficulty"
            value={dashboard?.stats.habitDifficultyMix ?? 'medium'}
            gradient="bg-gradient-to-br from-orange-900/30 to-red-900/20"
            iconGradient="bg-gradient-to-br from-orange-500 to-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(dashboard?.insights ?? []).map((insight) => {
            const Icon = insightIcons[insight.category];

            return (
              <InsightCard key={insight.id} title={insight.title} icon={Icon}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${insightToneStyles[insight.tone]}`}
                    >
                      {insightCategoryLabels[insight.category]}
                    </span>
                    <span className="text-sm font-semibold text-white/80">{insight.metric}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/75">{insight.summary}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                    {insight.confidence} confidence
                  </p>
                </div>
              </InsightCard>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
        >
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              to="/habits"
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <Target size={24} className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-center">Mark Habits</span>
            </Link>
            <Link
              to="/mood"
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <Heart size={24} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-center">Log Mood</span>
            </Link>
            <Link
              to="/planner"
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <Calendar size={24} className="text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-center">Open Planner</span>
            </Link>
            <Link
              to="/journal"
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <BookOpen size={24} className="text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-center">Add Journal</span>
            </Link>
            <Link
              to="/ai-coach"
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <Sparkles size={24} className="text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-center">Talk to AI</span>
            </Link>
            <Link
              to="/quit-support"
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <Ban size={24} className="text-red-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-center">Log Craving</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-violet-900/10 border border-blue-500/20 backdrop-blur-xl"
        >
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle size={20} className="text-blue-400" />
            <h3 className="font-semibold text-lg">Smart Alerts</h3>
          </div>
          <div className="space-y-3">
            {(dashboard?.alerts ?? []).map((alert) => (
              <div key={alert.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}

            {!loading && (dashboard?.alerts.length ?? 0) === 0 && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm">No alerts right now. Your system looks steady.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

