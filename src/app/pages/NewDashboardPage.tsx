import { motion } from 'motion/react';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/ui/StatCard';
import { InsightCard } from '../components/ui/InsightCard';
import {
  Target,
  Heart,
  Ban,
  Calendar,
  Droplet,
  Moon,
  Dumbbell,
  BookOpen,
  Zap,
  TrendingUp,
  AlertCircle,
  Sparkles,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router';

export function NewDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Hero Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/30 via-violet-900/20 to-emerald-900/20 border border-white/10 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10 opacity-50"></div>
          <div className="relative">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles
                    size={24}
                    className="text-yellow-400 animate-pulse"
                  />
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Good morning, Shree
                  </h1>
                </div>
                <p className="text-white/70 text-lg mb-3">
                  Ready to improve today?
                </p>
                <p className="text-white/60 text-sm max-w-2xl leading-relaxed bg-white/5 px-4 py-2 rounded-lg inline-block">
                  <span className="text-emerald-400 font-semibold">
                    Today's Focus:
                  </span>{' '}
                  Protect your momentum with small consistent wins
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-white/60 text-sm">Current Streak</p>
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                    7
                  </p>
                  <p className="text-white/60 text-xs">days</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Insight Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Today's Goals */}
          <InsightCard
            title="Today's Goals"
            icon={Target}
            action={{ label: 'View All', onClick: () => {} }}
          >
            <div className="space-y-3">
              {[
                { label: 'Run 2 km', done: true },
                { label: 'Drink 3L water', done: true },
                { label: 'No smoking', done: false },
                { label: 'Journal tonight', done: false },
                { label: 'Meditate 10 minutes', done: false },
              ].map((goal, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      goal.done
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-white/30'
                    }`}
                  >
                    {goal.done && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <span
                    className={`text-sm ${
                      goal.done ? 'text-white/60 line-through' : 'text-white'
                    }`}
                  >
                    {goal.label}
                  </span>
                </div>
              ))}
            </div>
          </InsightCard>

          {/* Habit Progress */}
          <InsightCard title="Habit Progress" icon={Target}>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">2/5</span>
                  <span className="text-sm text-white/60">completed</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                  />
                </div>
              </div>
              <p className="text-white/60 text-sm">
                <span className="text-blue-400 font-semibold">3 habits</span>{' '}
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

          {/* Mood Snapshot */}
          <InsightCard title="Mood Snapshot" icon={Heart}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl">
                  😊
                </div>
                <div>
                  <p className="font-semibold text-lg">Motivated</p>
                  <p className="text-white/60 text-sm">2 hours ago</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-white/60 text-xs mb-1">Energy</p>
                  <p className="font-semibold text-emerald-400">High</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Stress</p>
                  <p className="font-semibold text-yellow-400">Low</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Focus</p>
                  <p className="font-semibold text-blue-400">Good</p>
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

          {/* AI Insight Card */}
          <InsightCard
            title="AI Insight"
            icon={Sparkles}
            gradient="bg-gradient-to-br from-violet-900/30 to-purple-900/20"
          >
            <div className="space-y-3">
              <p className="text-white/80 text-sm leading-relaxed">
                You're on a <span className="text-orange-400 font-semibold">7-day streak</span>! 
                Your mood improves significantly after morning workouts. Consider protecting your 
                evening routine tonight.
              </p>
              <div className="flex items-center space-x-2 text-emerald-400 text-sm">
                <TrendingUp size={16} />
                <span>+23% consistency this week</span>
              </div>
            </div>
          </InsightCard>

          {/* Quit Support Snapshot */}
          <InsightCard
            title="Quit Support"
            icon={Ban}
            gradient="bg-gradient-to-br from-red-900/20 to-orange-900/10"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-xs mb-1">Smoke-Free</p>
                  <p className="text-2xl font-bold text-emerald-400">14</p>
                  <p className="text-white/60 text-xs">days</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Cravings Today</p>
                  <p className="text-2xl font-bold text-orange-400">2</p>
                  <p className="text-white/60 text-xs">resisted</p>
                </div>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-xs text-orange-300">
                  <span className="font-semibold">Trigger Alert:</span> Stress (evening)
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

          {/* Daily Planner Snapshot */}
          <InsightCard title="Daily Planner" icon={Calendar}>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock size={16} className="text-blue-400" />
                    <span className="text-sm">Workout (Morning)</span>
                  </div>
                  <CheckCircle size={16} className="text-emerald-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock size={16} className="text-violet-400" />
                    <span className="text-sm">Study Session</span>
                  </div>
                  <span className="text-xs text-white/40">Next</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Zap size={16} className="text-blue-400" />
                <span className="text-sm text-blue-300">Normal Mode</span>
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

        {/* Compact Stats Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <StatCard
            icon={Droplet}
            label="Water"
            value="1.5/3L"
            gradient="bg-gradient-to-br from-blue-900/30 to-cyan-900/20"
            iconGradient="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Moon}
            label="Sleep"
            value="7.5h"
            gradient="bg-gradient-to-br from-indigo-900/30 to-purple-900/20"
            iconGradient="bg-gradient-to-br from-indigo-500 to-purple-500"
          />
          <StatCard
            icon={Dumbbell}
            label="Workouts"
            value="4/7"
            subtitle="this week"
            gradient="bg-gradient-to-br from-orange-900/30 to-red-900/20"
            iconGradient="bg-gradient-to-br from-orange-500 to-red-500"
          />
          <StatCard
            icon={BookOpen}
            label="Journal"
            value="14"
            subtitle="day streak"
            gradient="bg-gradient-to-br from-amber-900/30 to-yellow-900/20"
            iconGradient="bg-gradient-to-br from-amber-500 to-yellow-500"
          />
          <StatCard
            icon={Zap}
            label="Energy"
            value="85%"
            gradient="bg-gradient-to-br from-emerald-900/30 to-green-900/20"
            iconGradient="bg-gradient-to-br from-emerald-500 to-green-500"
          />
          <StatCard
            icon={Target}
            label="Focus"
            value="Good"
            gradient="bg-gradient-to-br from-violet-900/30 to-purple-900/20"
            iconGradient="bg-gradient-to-br from-violet-500 to-purple-500"
          />
          <StatCard
            icon={Ban}
            label="Smoke-Free"
            value="14d"
            gradient="bg-gradient-to-br from-red-900/30 to-pink-900/20"
            iconGradient="bg-gradient-to-br from-red-500 to-pink-500"
          />
          <StatCard
            icon={Heart}
            label="Mood"
            value="😊"
            gradient="bg-gradient-to-br from-pink-900/30 to-rose-900/20"
            iconGradient="bg-gradient-to-br from-pink-500 to-rose-500"
          />
        </div>

        {/* Quick Action Panel */}
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
              <Target
                size={24}
                className="text-blue-400 mb-2 group-hover:scale-110 transition-transform"
              />
              <span className="text-sm text-center">Mark Habits</span>
            </Link>
            <Link
              to="/mood"
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <Heart
                size={24}
                className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform"
              />
              <span className="text-sm text-center">Log Mood</span>
            </Link>
            <Link
              to="/planner"
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <Calendar
                size={24}
                className="text-violet-400 mb-2 group-hover:scale-110 transition-transform"
              />
              <span className="text-sm text-center">Open Planner</span>
            </Link>
            <Link
              to="/journal"
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <BookOpen
                size={24}
                className="text-amber-400 mb-2 group-hover:scale-110 transition-transform"
              />
              <span className="text-sm text-center">Add Journal</span>
            </Link>
            <Link
              to="/ai-coach"
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <Sparkles
                size={24}
                className="text-yellow-400 mb-2 group-hover:scale-110 transition-transform"
              />
              <span className="text-sm text-center">Talk to AI</span>
            </Link>
            <Link
              to="/quit-support"
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <Ban
                size={24}
                className="text-red-400 mb-2 group-hover:scale-110 transition-transform"
              />
              <span className="text-sm text-center">Log Craving</span>
            </Link>
          </div>
        </motion.div>

        {/* Smart Alerts Panel */}
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
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm">
                <span className="text-orange-400">⚠️</span> You usually miss
                habits after 8 PM. Set a reminder?
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm">
                <span className="text-blue-400">💡</span> You're one day away
                from a <span className="font-semibold">7-day streak</span>!
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm">
                <span className="text-emerald-400">🎯</span> Cravings often
                happen after stressful evenings. Plan ahead.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
