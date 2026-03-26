import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Target, CheckCircle, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { OnboardingData } from '../../pages/OnboardingFlow';

interface StepSummaryProps {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
}

export function StepSummary({ data, onComplete, onBack }: StepSummaryProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti after component mounts
    const timer = setTimeout(() => {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981'],
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const coachLabels: Record<string, string> = {
    strict: 'Strict Coach 🪖',
    calm: 'Calm Mentor 🧘',
    motivational: 'Motivational Friend 🔥',
    discipline: 'Discipline Trainer ⚡',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6, delay: 0.3 }}
          className="inline-block"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50 mx-auto">
            <CheckCircle size={48} className="text-white" />
          </div>
        </motion.div>
        <h1 className="text-5xl font-bold text-white">You're all set!</h1>
        <p className="text-xl text-white/60">
          Here's your personalized journey overview
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        {/* Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 to-violet-900/20 border border-blue-500/20 backdrop-blur-xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Target className="text-blue-400" size={24} />
            <h3 className="text-white font-bold text-xl">Your Goals</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.goals.map((goal) => (
              <span
                key={goal}
                className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-medium"
              >
                {goal}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Habits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/20 backdrop-blur-xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="text-emerald-400" size={24} />
            <h3 className="text-white font-bold text-xl">Daily Habits</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[...data.habits, ...data.customHabits].map((habit) => (
              <div
                key={habit}
                className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-sm font-medium"
              >
                {habit}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/20 backdrop-blur-xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="text-violet-400" size={24} />
            <h3 className="text-white font-bold text-xl">Daily Schedule</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Wake up</span>
              <span className="text-white font-semibold">{data.routine.wakeTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Workout</span>
              <span className="text-white font-semibold">{data.routine.workoutTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Evening reminder</span>
              <span className="text-white font-semibold">{data.routine.reminderTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Sleep time</span>
              <span className="text-white font-semibold">{data.routine.sleepTime}</span>
            </div>
          </div>
        </motion.div>

        {/* AI Coach */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-orange-900/30 to-yellow-900/20 border border-orange-500/20 backdrop-blur-xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="text-orange-400" size={24} />
            <h3 className="text-white font-bold text-xl">Your AI Coach</h3>
          </div>
          <p className="text-white text-lg font-semibold">
            {coachLabels[data.coachPersonality] || 'Not selected'}
          </p>
        </motion.div>
      </div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex justify-between pt-8"
      >
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 rounded-xl font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
        >
          Back
        </motion.button>
        <motion.button
          onClick={onComplete}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-5 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-emerald-600 via-blue-600 to-violet-600 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all relative overflow-hidden"
        >
          <motion.div
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]"
          ></motion.div>
          <span className="relative z-10">Start My Journey 🚀</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
