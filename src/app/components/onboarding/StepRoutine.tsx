import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

interface StepRoutineProps {
  routine: {
    wakeTime: string;
    workoutTime: string;
    reminderTime: string;
    sleepTime: string;
  };
  onUpdate: (routine: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepRoutine({ routine, onUpdate, onNext, onBack }: StepRoutineProps) {
  const timeSlots = [
    { id: 'wakeTime', label: 'Wake up time', icon: '🌅' },
    { id: 'workoutTime', label: 'Workout time', icon: '💪' },
    { id: 'reminderTime', label: 'Evening reminder', icon: '⏰' },
    { id: 'sleepTime', label: 'Sleep time', icon: '😴' },
  ];

  const updateTime = (field: string, value: string) => {
    onUpdate({ ...routine, [field]: value });
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
        <h1 className="text-5xl font-bold text-white">Set your daily routine</h1>
        <p className="text-xl text-white/60">
          Help us understand your schedule
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 py-8">
        {timeSlots.map((slot, index) => (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{slot.icon}</div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{slot.label}</h3>
                  <p className="text-white/40 text-sm">Set your preferred time</p>
                </div>
              </div>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                  size={20}
                />
                <input
                  type="time"
                  value={routine[slot.id as keyof typeof routine]}
                  onChange={(e) => updateTime(slot.id, e.target.value)}
                  className="pl-12 pr-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 focus:shadow-lg focus:shadow-blue-500/20 transition-all"
                />
              </div>
            </div>
          </motion.div>
        ))}
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
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
}
