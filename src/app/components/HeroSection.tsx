import { motion } from 'motion/react';
import { Play, TrendingUp, Brain, Heart, BarChart3 } from 'lucide-react';
import { Link } from 'react-router';

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span>AI-powered self-improvement platform</span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              Build a{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                stronger body
              </span>
              , calmer mind, and better life
            </h1>

            <p className="text-xl text-white/70 leading-relaxed">
              Track your habits, monitor your mood, and chat with your personal AI coach.
              Transform your life one day at a time with intelligent insights and daily motivation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 text-white font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-shadow"
                >
                  Start Your Journey
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl border-2 border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-all flex items-center justify-center space-x-2"
              >
                <Play size={20} fill="currentColor" />
                <span>Watch Demo</span>
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
              {[
                { icon: TrendingUp, label: 'Habit Tracking' },
                { icon: Brain, label: 'AI Coaching' },
                { icon: Heart, label: 'Mood Support' },
                { icon: BarChart3, label: 'Analytics' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                  className="flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <item.icon size={20} className="text-blue-400" />
                  </div>
                  <span className="text-xs text-white/60">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual System - Floating Widgets */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative h-[600px] hidden lg:block"
          >
            {/* Main Dashboard Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 rounded-3xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-2xl p-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">Today's Progress</h3>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500"></div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Morning Run', done: true },
                    { label: 'Meditation', done: true },
                    { label: 'Read 30 min', done: true },
                    { label: 'Journal', done: false },
                  ].map((habit, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          habit.done
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-white/20'
                        }`}
                      ></div>
                      <span className={`text-sm ${habit.done ? 'text-white/50 line-through' : 'text-white'}`}>
                        {habit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating Widget: Streak */}
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 right-12 w-40 h-32 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl border border-orange-500/30 shadow-xl p-4"
            >
              <div className="text-5xl font-bold text-orange-400">12</div>
              <div className="text-sm text-white/70">Day Streak 🔥</div>
            </motion.div>

            {/* Floating Widget: Mood */}
            <motion.div
              animate={{ y: [0, 12, 0], rotate: [0, -2, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-32 left-0 w-36 h-28 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 backdrop-blur-xl border border-violet-500/30 shadow-xl p-4"
            >
              <div className="text-4xl font-bold text-violet-400">8/10</div>
              <div className="text-sm text-white/70">Mood Score 😊</div>
            </motion.div>

            {/* Floating Widget: Habits Completed */}
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="absolute bottom-32 right-8 w-36 h-28 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 shadow-xl p-4"
            >
              <div className="text-4xl font-bold text-emerald-400">4/5</div>
              <div className="text-sm text-white/70">Completed ✓</div>
            </motion.div>

            {/* Floating Widget: Smoke-free */}
            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -3, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-8 left-12 w-40 h-28 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 shadow-xl p-4"
            >
              <div className="text-4xl font-bold text-blue-400">6</div>
              <div className="text-sm text-white/70">Smoke-free days 🚭</div>
            </motion.div>

            {/* AI Message Bubble */}
            <motion.div
              animate={{ y: [0, -8, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute top-1/2 right-0 w-48 px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-xl"
            >
              <p className="text-sm text-white/90">
                "Small wins still count." 💪
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}