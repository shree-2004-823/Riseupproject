import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Target, Flame, Heart, ArrowLeft } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to landing</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <div>
            <h2 className="text-5xl font-bold text-white mb-4">
              Welcome to Your Dashboard! 🎉
            </h2>
            <p className="text-xl text-white/60">
              You've successfully completed onboarding
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-orange-900/30 to-red-900/20 border border-orange-500/20 backdrop-blur-xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <Flame className="text-white" size={32} />
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-1">Current Streak</p>
                  <p className="text-4xl font-bold text-white">0 days</p>
                  <p className="text-white/40 text-xs mt-2">Start tracking today!</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/30 to-violet-900/20 border border-blue-500/20 backdrop-blur-xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg">
                  <Target className="text-white" size={32} />
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-1">Today's Habits</p>
                  <p className="text-4xl font-bold text-white">0/5</p>
                  <p className="text-white/40 text-xs mt-2">Let's get started!</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/20 backdrop-blur-xl"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Heart className="text-white" size={32} />
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-1">Mood Today</p>
                  <p className="text-4xl font-bold text-white">--</p>
                  <p className="text-white/40 text-xs mt-2">Track your mood</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Coming Soon Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 p-8 rounded-2xl bg-white/5 border border-white/10 max-w-2xl mx-auto"
          >
            <p className="text-white/70 text-lg">
              Full dashboard features coming soon! This demonstrates the complete onboarding flow. 🚀
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
