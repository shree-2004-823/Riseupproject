import { motion } from 'motion/react';
import { Dumbbell, Brain, Zap, Cigarette, Wine, Moon, Heart } from 'lucide-react';

interface StepGoalsProps {
  selectedGoals: string[];
  onUpdate: (goals: string[]) => void;
  onNext: () => void;
}

const goals = [
  { id: 'fitness', label: 'Get Fit', icon: Dumbbell, color: 'from-blue-500 to-cyan-500' },
  { id: 'mental', label: 'Improve Mental Health', icon: Brain, color: 'from-violet-500 to-purple-500' },
  { id: 'discipline', label: 'Build Discipline', icon: Zap, color: 'from-yellow-500 to-orange-500' },
  { id: 'quit-smoking', label: 'Quit Smoking', icon: Cigarette, color: 'from-orange-500 to-red-500' },
  { id: 'quit-drinking', label: 'Quit Drinking', icon: Wine, color: 'from-red-500 to-pink-500' },
  { id: 'sleep', label: 'Sleep Better', icon: Moon, color: 'from-indigo-500 to-blue-500' },
  { id: 'emotional', label: 'Emotional Balance', icon: Heart, color: 'from-pink-500 to-rose-500' },
];

export function StepGoals({ selectedGoals, onUpdate, onNext }: StepGoalsProps) {
  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      onUpdate(selectedGoals.filter((g) => g !== goalId));
    } else {
      onUpdate([...selectedGoals, goalId]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-white">What are your goals?</h1>
        <p className="text-xl text-white/60">
          Select all that apply. We'll personalize your experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selectedGoals.includes(goal.id);

          return (
            <motion.button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`p-6 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-white/50 bg-white/10 shadow-lg shadow-blue-500/20'
                  : 'border-white/10 bg-zinc-900/50 hover:border-white/30'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="text-white" size={32} />
                </div>
                <span className="text-white font-semibold text-lg">{goal.label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-center pt-8">
        <motion.button
          onClick={onNext}
          disabled={selectedGoals.length === 0}
          whileHover={selectedGoals.length > 0 ? { scale: 1.05, y: -2 } : {}}
          whileTap={selectedGoals.length > 0 ? { scale: 0.95 } : {}}
          className={`px-12 py-4 rounded-xl font-bold text-white transition-all ${
            selectedGoals.length > 0
              ? 'bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50'
              : 'bg-white/10 cursor-not-allowed opacity-50'
          }`}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
}
