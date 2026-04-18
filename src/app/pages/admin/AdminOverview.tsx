import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { AdminMetricsResponse } from '@/lib/types';

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  violet: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
};

export function AdminOverview() {
  const [data, setData] = useState<AdminMetricsResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void apiFetch<AdminMetricsResponse>('/admin/metrics')
      .then((response) => {
        setData(response);
      })
      .catch((requestError) => {
        if (requestError instanceof ApiError) {
          setError(requestError.message);
        } else {
          setError('Unable to load admin metrics.');
        }
      });
  }, []);

  const stats = data
    ? [
        {
          label: 'Total Users',
          value: data.stats.totalUsers,
          note: `${data.stats.onboardedUsers} onboarded`,
          icon: Users,
          color: 'blue',
        },
        {
          label: 'Active Today',
          value: data.stats.activeToday,
          note: `${data.stats.habitCompletionsToday} habit completions`,
          icon: Activity,
          color: 'emerald',
        },
        {
          label: 'New This Week',
          value: data.stats.newUsersThisWeek,
          note: `${data.stats.admins} admins`,
          icon: TrendingUp,
          color: 'violet',
        },
        {
          label: 'Mood Check-Ins',
          value: data.stats.moodCheckInsToday,
          note: `${data.stats.cravingLogsToday} cravings logged`,
          icon: Zap,
          color: 'amber',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-xl">Overview</h1>
        <p className="text-gray-500 text-sm mt-0.5">Live product health and recent user activity</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.length === 0
          ? Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-[106px] rounded-xl bg-[#1a1d27] border border-white/10 animate-pulse" />
            ))
          : stats.map(({ label, value, note, icon: Icon, color }) => (
              <div key={label} className="bg-[#1a1d27] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">{label}</span>
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${colorMap[color]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-white text-2xl">{value}</div>
                <div className="text-gray-500 text-xs mt-1">{note}</div>
              </div>
            ))}
      </div>

      <div className="bg-[#1a1d27] border border-white/10 rounded-xl p-5">
        <h2 className="text-white text-sm mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {(data?.recentActivity ?? []).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs shrink-0">
                  {entry.actor[0]}
                </div>
                <div>
                  <span className="text-white text-sm">{entry.actor}</span>
                  <span className="text-gray-500 text-sm"> - {entry.action}</span>
                  <div className="text-[11px] text-gray-600">{entry.email}</div>
                </div>
              </div>
              <span className="text-gray-600 text-xs shrink-0 ml-4">
                {new Date(entry.at).toLocaleDateString()}
              </span>
            </div>
          ))}
          {!error && data && data.recentActivity.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-6">No recent activity yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
