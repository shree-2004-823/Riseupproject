import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Plus, X } from 'lucide-react';

interface StepHabitsProps {
  selectedHabits: string[];
  customHabits: string[];
  onUpdate: (habits: string[], customHabits: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const defaultHabits = [
  'Exercise',
  'Running',
  'Drink water',
  'Meditation',
  'Reading',
  'Sleep on time',
  'No smoking',
  'No alcohol',
  'Journal daily',
  'Eat healthy',
  'Take vitamins',
  'Stretch',
];

export function StepHabits({
  selectedHabits,
  customHabits,
  onUpdate,
  onNext,
  onBack,
}: StepHabitsProps) {
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleHabit = (habit: string) => {
    if (selectedHabits.includes(habit)) {
      onUpdate(
        selectedHabits.filter((h) => h !== habit),
        customHabits
      );
    } else {
      onUpdate([...selectedHabits, habit], customHabits);
    }
  };

  const addCustomHabit = () => {
    if (customInput.trim() && !customHabits.includes(customInput.trim())) {
      const newCustomHabits = [...customHabits, customInput.trim()];
      onUpdate([...selectedHabits, customInput.trim()], newCustomHabits);
      setCustomInput('');
      setShowCustomInput(false);
    }
  };

  const removeCustomHabit = (habit: string) => {
    onUpdate(
      selectedHabits.filter((h) => h !== habit),
      customHabits.filter((h) => h !== habit)
    );
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
        <h1 className="text-5xl font-bold text-white">Select your habits</h1>
        <p className="text-xl text-white/60">
          Choose habits you want to track daily
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-8">
        {defaultHabits.map((habit) => {
          const isSelected = selectedHabits.includes(habit);

          return (
            <motion.button
              key={habit}
              onClick={() => toggleHabit(habit)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-xl border-2 transition-all relative ${
                isSelected
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-white/10 bg-zinc-900/50 hover:border-white/30'
              }`}
            >
              <span className="text-white font-medium">{habit}</span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
                >
                  <Check size={14} className="text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}

        {/* Custom habits */}
        {customHabits.map((habit) => (
          <motion.div
            key={habit}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 shadow-lg relative"
          >
            <span className="text-white font-medium">{habit}</span>
            <button
              onClick={() => removeCustomHabit(habit)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={14} className="text-white" />
            </button>
          </motion.div>
        ))}

        {/* Add custom habit button */}
        {!showCustomInput ? (
          <motion.button
            onClick={() => setShowCustomInput(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-xl border-2 border-dashed border-white/30 bg-zinc-900/30 hover:border-white/50 transition-all"
          >
            <div className="flex items-center justify-center space-x-2 text-white/60">
              <Plus size={20} />
              <span className="font-medium">Add Custom</span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-2 rounded-xl border-2 border-emerald-500/50 bg-zinc-900/50"
          >
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomHabit()}
              placeholder="Enter habit..."
              autoFocus
              className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-white/40 mb-2"
            />
            <div className="flex space-x-1">
              <button
                onClick={addCustomHabit}
                className="flex-1 py-1 rounded bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomInput('');
                }}
                className="flex-1 py-1 rounded bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
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
          disabled={selectedHabits.length === 0}
          whileHover={selectedHabits.length > 0 ? { scale: 1.05, y: -2 } : {}}
          whileTap={selectedHabits.length > 0 ? { scale: 0.95 } : {}}
          className={`px-12 py-4 rounded-xl font-bold text-white transition-all ${
            selectedHabits.length > 0
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
