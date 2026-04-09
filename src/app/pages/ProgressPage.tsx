import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { TrendingUp, Award, Target, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const mockData = [
  { day: 'Mon', habits: 4 },
  { day: 'Tue', habits: 5 },
  { day: 'Wed', habits: 3 },
  { day: 'Thu', habits: 5 },
  { day: 'Fri', habits: 4 },
  { day: 'Sat', habits: 5 },
  { day: 'Sun', habits: 5 },
];

export function ProgressPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Progress</h1>
          <p className="text-white/60">Track your growth and patterns</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: TrendingUp, label: 'Current Streak', value: '7 days', color: 'orange' },
            { icon: Target, label: 'Habits This Week', value: '31/35', color: 'blue' },
            { icon: Heart, label: 'Mood Average', value: '8.2/10', color: 'emerald' },
            { icon: Award, label: 'Consistency', value: '87%', color: 'violet' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl bg-gradient-to-br from-${stat.color}-900/30 to-${stat.color}-900/20 border border-${stat.color}-500/30`}
              >
                <Icon size={24} className={`text-${stat.color}-400 mb-3`} />
                <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <h3 className="font-semibold text-lg mb-4">Weekly Habit Completion</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(24, 24, 27, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="habits" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <h3 className="font-semibold text-lg mb-4">AI Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-sm text-emerald-300">
                  <span className="font-semibold">💪 Strength:</span> Your mood improves significantly on workout days
                </p>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  <span className="font-semibold">📈 Improvement:</span> Consistency is up 23% from last week
                </p>
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-300">
                  <span className="font-semibold">⚡ Opportunity:</span> Evening habits need more attention
                </p>
              </div>
              <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                <p className="text-sm text-violet-300">
                  <span className="font-semibold">🎯 Goal:</span> You're 3 days away from a 10-day milestone
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
