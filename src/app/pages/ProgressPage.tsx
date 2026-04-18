import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Award, Heart, ShieldAlert, Target, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';
import { apiFetch, ApiError } from '@/lib/api';
import type { ProgressResponse } from '@/lib/types';

const rangeOptions = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
] as const;

const statAppearance = {
  orange: {
    card: 'from-orange-900/30 to-orange-900/20 border-orange-500/30',
    icon: 'text-orange-400',
  },
  blue: {
    card: 'from-blue-900/30 to-blue-900/20 border-blue-500/30',
    icon: 'text-blue-400',
  },
  emerald: {
    card: 'from-emerald-900/30 to-emerald-900/20 border-emerald-500/30',
    icon: 'text-emerald-400',
  },
  violet: {
    card: 'from-violet-900/30 to-violet-900/20 border-violet-500/30',
    icon: 'text-violet-400',
  },
} as const;

const insightAppearance = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-300',
} as const;

const statIcons = [Target, TrendingUp, Heart, Award];

function SummaryTile(props: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/35">{props.label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{props.value}</p>
      {props.note ? <p className="mt-1 text-sm text-white/50">{props.note}</p> : null}
    </div>
  );
}

function EmptyState(props: { message: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-6 text-center text-sm text-white/50">
      {props.message}
    </div>
  );
}

function HabitRows(props: {
  title: string;
  rows: ProgressResponse['habitScores']['strongest'];
  emptyMessage: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3">
        <h4 className="font-medium text-white">{props.title}</h4>
      </div>
      {props.rows.length === 0 ? (
        <div className="px-4 py-6 text-sm text-white/50">{props.emptyMessage}</div>
      ) : (
        <div className="divide-y divide-white/10">
          {props.rows.map((habit) => (
            <div key={habit.id} className="grid grid-cols-[1.6fr_0.7fr_0.7fr] gap-3 px-4 py-3 text-sm">
              <div>
                <div className="font-medium text-white">{habit.name}</div>
                <div className="text-white/45">{habit.completedDays}/{habit.targetDays} days completed</div>
              </div>
              <div className="text-white/75">{habit.completionRate}%</div>
              <div className="text-white/55">{habit.currentStreak}d streak</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProgressPage() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [error, setError] = useState('');
  const [range, setRange] = useState<(typeof rangeOptions)[number]['value']>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadProgress(range);
  }, [range]);

  async function loadProgress(nextRange: (typeof rangeOptions)[number]['value']) {
    setLoading(true);
    setError('');

    try {
      const response = await apiFetch<ProgressResponse>(`/progress?range=${nextRange}`);
      setData(response);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to load progress analytics right now.');
      }
    } finally {
      setLoading(false);
    }
  }

  const hasHabitTrend = (data?.habitTrend ?? []).some((entry) => entry.target > 0);
  const hasMoodTrend = (data?.moodTrend ?? []).some((entry) => entry.mood != null);
  const hasCravingTrend = (data?.cravingTrend ?? []).some((entry) => entry.cravings > 0);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Progress</h1>
          <p className="text-white/60">Track real completion, streak, mood, craving, and planner patterns over time</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              disabled={loading && option.value === range}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                range === option.value
                  ? 'border-blue-500/30 bg-blue-500/15 text-blue-200'
                  : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
          <span className="text-sm text-white/40">
            {loading ? 'Refreshing analytics...' : `Showing ${range}`}
          </span>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(data?.stats ?? []).map((stat, index) => {
            const Icon = statIcons[index] ?? TrendingUp;
            const appearance = statAppearance[stat.tone];

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${appearance.card} border`}
              >
                <Icon size={24} className={`${appearance.icon} mb-3`} />
                <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
                {stat.note ? <p className="mt-2 text-sm text-white/45">{stat.note}</p> : null}
              </motion.div>
            );
          })}

          {loading && !data
            ? Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-[144px] rounded-2xl bg-zinc-900/50 border border-white/10 animate-pulse" />
              ))
            : null}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <SummaryTile
            label="Longest Streak"
            value={`${data?.streaks.longestHabitStreak ?? 0} days`}
            note={`Current run: ${data?.streaks.currentHabitStreak ?? 0} days`}
          />
          <SummaryTile
            label="Planner Completion"
            value={`${data?.summary.plannerCompletionRate ?? 0}%`}
            note={`Mood check-in streak: ${data?.streaks.moodCheckInStreak ?? 0} days`}
          />
          <SummaryTile
            label="Top Trigger"
            value={data?.summary.topTrigger ?? 'None yet'}
            note={data?.summary.topTimeWindow ? `Most common window: ${data.summary.topTimeWindow}` : 'Keep logging cravings to reveal timing'}
          />
          <SummaryTile
            label="Craving Intensity"
            value={data?.summary.averageCravingIntensity != null ? `${data.summary.averageCravingIntensity}/10` : 'No data'}
            note={`${data?.summary.resistedCravings ?? 0} resisted out of ${data?.summary.totalCravings ?? 0}`}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-lg">Habit Completion Rate</h3>
                <p className="text-sm text-white/50">Daily completion percentage against active habits</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">14-Day Average</p>
                <p className="text-xl font-semibold text-blue-300">{data?.summary.habitCompletionRate ?? 0}%</p>
              </div>
            </div>
            <div className="h-72">
              {hasHabitTrend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.habitTrend ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(24, 24, 27, 0.94)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'completionRate') return [`${value}%`, 'Completion'];
                        if (name === 'completed') return [value, 'Completed habits'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="completionRate" fill="url(#habitCompletionGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="habitCompletionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No habit targets have been tracked yet in this period." />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-lg">Mood Trend</h3>
                <p className="text-sm text-white/50">Daily emotional trend from check-ins</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">Direction</p>
                <p className="text-xl font-semibold text-emerald-300 capitalize">{data?.summary.moodDirection ?? 'steady'}</p>
              </div>
            </div>
            <div className="h-72">
              {hasMoodTrend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.moodTrend ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(24, 24, 27, 0.94)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      connectNulls={false}
                      stroke="#34d399"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No mood check-ins were logged in this period." />
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-lg">Craving Patterns</h3>
              <p className="text-sm text-white/50">Daily urge volume split by resisted vs relapsed outcomes</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Resistance Rate</p>
              <p className="text-xl font-semibold text-violet-300">{data?.summary.cravingResistanceRate ?? 0}%</p>
            </div>
          </div>
          <div className="h-72">
            {hasCravingTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.cravingTrend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(24, 24, 27, 0.94)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="resisted" stackId="cravings" fill="#34d399" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="relapsed" stackId="cravings" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No cravings were logged in this period." />
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-lg">Habit Performance</h3>
                <p className="text-sm text-white/50">Strongest and weakest habits based on recent completion</p>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <HabitRows
                title="Strongest Habits"
                rows={data?.habitScores.strongest ?? []}
                emptyMessage="No habit history yet."
              />
              <HabitRows
                title="Weakest Habits"
                rows={data?.habitScores.weakest ?? []}
                emptyMessage="No weak habits to highlight yet."
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-lg">Craving Breakdown</h3>
                <p className="text-sm text-white/50">Trigger counts and time-of-day pattern</p>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="border-b border-white/10 px-4 py-3">
                  <h4 className="font-medium text-white">Top Triggers</h4>
                </div>
                {(data?.cravingTriggerCounts.length ?? 0) > 0 ? (
                  <div className="divide-y divide-white/10">
                    {data?.cravingTriggerCounts.map((trigger) => (
                      <div key={trigger.label} className="flex items-center justify-between px-4 py-3 text-sm">
                        <span className="text-white/75">{trigger.label}</span>
                        <span className="text-white font-medium">{trigger.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-sm text-white/50">No trigger data yet.</div>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="border-b border-white/10 px-4 py-3">
                  <h4 className="font-medium text-white">Time of Day</h4>
                </div>
                {(data?.cravingTimePattern.some((entry) => entry.count > 0) ?? false) ? (
                  <div className="divide-y divide-white/10">
                    {data?.cravingTimePattern.map((entry) => (
                      <div key={entry.label} className="flex items-center justify-between px-4 py-3 text-sm">
                        <span className="capitalize text-white/75">{entry.label}</span>
                        <span className="text-white font-medium">{entry.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-sm text-white/50">No time-of-day craving pattern yet.</div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
        >
          <h3 className="font-semibold text-lg mb-4">Progress Insights</h3>
          <div className="space-y-4">
            {(data?.insights ?? []).map((insight) => (
              <div key={insight.title} className={`p-4 border rounded-lg ${insightAppearance[insight.tone]}`}>
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold">{insight.title}:</span> {insight.message}
                </p>
              </div>
            ))}
            {loading && !data ? <div className="text-sm text-white/50">Loading insights...</div> : null}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
