import { motion } from 'motion/react';
import { Flame, Target, Heart } from 'lucide-react';

export function FloatingWidgets() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center space-y-12">
      {/* Motivational Text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center space-y-4"
      >
        <h2 className="text-5xl font-bold text-white">
          Start your transformation today
        </h2>
        <p className="text-2xl text-white/80">
          Small steps. Big results.
        </p>
      </motion.div>

      {/* Floating UI Widgets */}
      <div className="relative w-full max-w-md h-64">
        {/* Streak Counter */}
        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-0 left-8 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="text-white" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Current Streak</p>
              <p className="text-3xl font-bold text-white">12 days</p>
            </div>
          </div>
        </motion.div>

        {/* Habit Progress */}
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute top-32 right-8 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <Target className="text-white" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Today's Habits</p>
              <p className="text-3xl font-bold text-white">4/5</p>
            </div>
          </div>
        </motion.div>

        {/* Mood Score */}
        <motion.div
          animate={{
            y: [0, -18, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-0 left-20 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Heart className="text-white" size={24} />
            </div>
            <div>
              <p className="text-white/70 text-sm">Mood Score</p>
              <p className="text-3xl font-bold text-white">8/10</p>
            </div>
          </div>
        </motion.div>

        {/* Glowing Orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400/30 to-violet-400/30 blur-3xl"
        ></motion.div>
      </div>
    </div>
  );
}
