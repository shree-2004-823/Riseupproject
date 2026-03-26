import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', habits: 4, id: 'mon' },
  { day: 'Tue', habits: 5, id: 'tue' },
  { day: 'Wed', habits: 3, id: 'wed' },
  { day: 'Thu', habits: 5, id: 'thu' },
  { day: 'Fri', habits: 4, id: 'fri' },
  { day: 'Sat', habits: 5, id: 'sat' },
  { day: 'Sun', habits: 4, id: 'sun' },
];

const moodData = [
  { day: 'Mon', mood: 7, id: 'mood-mon' },
  { day: 'Tue', mood: 6, id: 'mood-tue' },
  { day: 'Wed', mood: 8, id: 'mood-wed' },
  { day: 'Thu', mood: 7, id: 'mood-thu' },
  { day: 'Fri', mood: 9, id: 'mood-fri' },
  { day: 'Sat', mood: 8, id: 'mood-sat' },
  { day: 'Sun', mood: 8, id: 'mood-sun' },
];

export function ProgressSection() {
  return (
    <section id="progress" className="relative py-32 bg-gradient-to-b from-zinc-900 to-zinc-950">
      {/* SVG Definitions for all gradients - defined once at top level */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="barChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Track your{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              progress
            </span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Visualize your growth with detailed analytics and AI-powered insights
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weekly Habit Completion Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Weekly Habit Completion</h3>
              <p className="text-white/60 text-sm">Your consistency this week</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData} id="weekly-habits-chart">
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" key="bar-xaxis" />
                <YAxis stroke="rgba(255,255,255,0.5)" key="bar-yaxis" />
                <Tooltip
                  key="bar-tooltip"
                  contentStyle={{
                    backgroundColor: 'rgba(24, 24, 27, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white',
                  }}
                />
                <Bar
                  key="bar-habits"
                  dataKey="habits"
                  fill="url(#barChartGradient)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Mood Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Mood Trend</h3>
              <p className="text-white/60 text-sm">Your emotional journey</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={moodData} id="mood-trend-chart">
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" key="line-xaxis" />
                <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 10]} key="line-yaxis" />
                <Tooltip
                  key="line-tooltip"
                  contentStyle={{
                    backgroundColor: 'rgba(24, 24, 27, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white',
                  }}
                />
                <Line
                  key="line-mood"
                  type="monotone"
                  dataKey="mood"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Circular Progress - Consistency Score */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Consistency Score</h3>
              <p className="text-white/60 text-sm">Overall performance this month</p>
            </div>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-56 h-56">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="112"
                    cy="112"
                    r="100"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="16"
                    fill="none"
                  />
                  <motion.circle
                    cx="112"
                    cy="112"
                    r="100"
                    stroke="url(#progressGradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 628 }}
                    whileInView={{ strokeDashoffset: 628 - (628 * 85) / 100 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    strokeDasharray="628"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"
                  >
                    85%
                  </motion.span>
                  <span className="text-white/60 text-sm mt-2">Excellent!</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Insight Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative p-8 rounded-3xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 backdrop-blur-xl border border-violet-500/20 shadow-2xl overflow-hidden"
          >
            {/* Glow Effect */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Brain size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Insight</h3>
                  <p className="text-white/60 text-sm">Personalized for you</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-white/90 leading-relaxed text-lg">
                  "You are strongest in mornings. Consider scheduling your most important habits between 6-10 AM."
                </p>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/80 text-sm mb-3">
                    <strong>Recommendation:</strong> Improve evening consistency by setting earlier reminders.
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Evening completion rate</span>
                    <span className="text-orange-400 font-semibold">62%</span>
                  </div>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '62%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    ></motion.div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold shadow-lg hover:shadow-xl transition-shadow"
                >
                  Get More Insights
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}