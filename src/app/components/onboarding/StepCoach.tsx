import { motion } from 'motion/react';
import { Shield, Sparkles, Flame, Zap } from 'lucide-react';

interface StepCoachProps {
  selectedCoach: string;
  onUpdate: (coach: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const coaches = [
  {
    id: 'strict',
    label: 'Strict Coach',
    icon: Shield,
    emoji: '🪖',
    color: 'from-red-500 to-orange-500',
    description: 'No excuses. Push your limits. Discipline is everything.',
  },
  {
    id: 'calm',
    label: 'Calm Mentor',
    icon: Sparkles,
    emoji: '🧘',
    color: 'from-blue-500 to-cyan-500',
    description: 'Gentle guidance. Mindfulness first. Progress over perfection.',
  },
  {
    id: 'motivational',
    label: 'Motivational Friend',
    icon: Flame,
    emoji: '🔥',
    color: 'from-orange-500 to-yellow-500',
    description: 'You got this! Every day is a new opportunity to shine.',
  },
  {
    id: 'discipline',
    label: 'Discipline Trainer',
    icon: Zap,
    emoji: '⚡',
    color: 'from-violet-500 to-purple-500',
    description: 'Build habits through structure. Consistency is the key.',
  },
];

export function StepCoach({ selectedCoach, onUpdate, onNext, onBack }: StepCoachProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-white">Choose your AI coach</h1>
        <p className="text-xl text-white/60">
          Select a personality that resonates with you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 max-w-4xl mx-auto">
        {coaches.map((coach) => {
          const Icon = coach.icon;
          const isSelected = selectedCoach === coach.id;

          return (
            <motion.button
              key={coach.id}
              onClick={() => onUpdate(coach.id)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`p-8 rounded-2xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-white/50 bg-white/10 shadow-lg shadow-blue-500/20'
                  : 'border-white/10 bg-zinc-900/50 hover:border-white/30'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${coach.color} flex items-center justify-center shadow-lg text-3xl`}
                  >
                    {coach.emoji}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{coach.label}</h3>
                    {isSelected && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-blue-400 text-sm font-semibold"
                      >
                        ✓ Selected
                      </motion.span>
                    )}
                  </div>
                </div>
                <p className="text-white/70 leading-relaxed">{coach.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-between pt-8">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 rounded-xl font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
        >
          Back
        </motion.button>
        <motion.button
          onClick={onNext}
          disabled={!selectedCoach}
          whileHover={selectedCoach ? { scale: 1.05, y: -2 } : {}}
          whileTap={selectedCoach ? { scale: 0.95 } : {}}
          className={`px-12 py-4 rounded-xl font-bold text-white transition-all ${
            selectedCoach
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
