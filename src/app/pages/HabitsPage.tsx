import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLayout } from '../components/layout/AppLayout';
import {
  Plus,
  Target,
  Flame,
  Filter,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Check,
  X,
  TrendingUp,
  Award,
} from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  category: 'physical' | 'mental' | 'emotional' | 'discipline' | 'recovery';
  completed: boolean;
  streak: number;
  frequency: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time?: string;
}

const mockHabits: Habit[] = [
  {
    id: '1',
    name: 'Morning Run',
    category: 'physical',
    completed: true,
    streak: 7,
    frequency: 'Daily',
    difficulty: 'medium',
    time: '6:00 AM',
  },
  {
    id: '2',
    name: 'Drink 3L Water',
    category: 'physical',
    completed: true,
    streak: 14,
    frequency: 'Daily',
    difficulty: 'easy',
  },
  {
    id: '3',
    name: 'No Smoking',
    category: 'recovery',
    completed: false,
    streak: 14,
    frequency: 'Daily',
    difficulty: 'hard',
  },
  {
    id: '4',
    name: 'Meditation 10 min',
    category: 'mental',
    completed: false,
    streak: 5,
    frequency: 'Daily',
    difficulty: 'medium',
    time: '7:00 AM',
  },
  {
    id: '5',
    name: 'Journal Entry',
    category: 'emotional',
    completed: false,
    streak: 14,
    frequency: 'Daily',
    difficulty: 'easy',
    time: '9:00 PM',
  },
  {
    id: '6',
    name: 'Read 20 pages',
    category: 'mental',
    completed: false,
    streak: 3,
    frequency: 'Daily',
    difficulty: 'medium',
  },
];

const categoryColors = {
  physical: { bg: 'from-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
  mental: { bg: 'from-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
  emotional: { bg: 'from-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  discipline: { bg: 'from-violet-500/20', border: 'border-violet-500/30', text: 'text-violet-400' },
  recovery: { bg: 'from-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
};

export function HabitsPage() {
  const [habits, setHabits] = useState(mockHabits);
  const [filter, setFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;
  const completionPercentage = (completedCount / totalCount) * 100;

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Habits</h1>
            <p className="text-white/60">
              Build consistency, one day at a time
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
          >
            <Plus size={20} />
            <span>Add Habit</span>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 to-violet-900/20 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <Target size={24} className="text-blue-400" />
              <span className="text-3xl font-bold">{completedCount}/{totalCount}</span>
            </div>
            <p className="text-white/60 text-sm">Today's Progress</p>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-orange-900/30 to-amber-900/20 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <Flame size={24} className="text-orange-400" />
              <span className="text-3xl font-bold">14</span>
            </div>
            <p className="text-white/60 text-sm">Longest Streak</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-green-900/20 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar size={24} className="text-emerald-400" />
              <span className="text-3xl font-bold">6</span>
            </div>
            <p className="text-white/60 text-sm">Active Habits</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} className="text-violet-400" />
              <span className="text-3xl font-bold">87%</span>
            </div>
            <p className="text-white/60 text-sm">This Week</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Filter size={18} className="text-white/60 flex-shrink-0" />
          {['all', 'physical', 'mental', 'emotional', 'discipline', 'recovery'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white border border-blue-500/30'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits
            .filter((h) => filter === 'all' || h.category === filter)
            .map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-5 rounded-2xl border backdrop-blur-xl transition-all ${
                  habit.completed
                    ? 'bg-emerald-900/20 border-emerald-500/30'
                    : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        habit.completed
                          ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/25'
                          : 'border-white/30 hover:border-blue-500'
                      }`}
                    >
                      {habit.completed && <Check size={16} className="text-white" />}
                    </button>

                    {/* Habit Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3
                          className={`font-semibold text-lg ${
                            habit.completed ? 'text-white/70 line-through' : 'text-white'
                          }`}
                        >
                          {habit.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${
                            categoryColors[habit.category].bg
                          } ${categoryColors[habit.category].text} ${
                            categoryColors[habit.category].border
                          } border`}
                        >
                          {habit.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            habit.difficulty === 'hard'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : habit.difficulty === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}
                        >
                          {habit.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-white/60">
                        <div className="flex items-center space-x-1">
                          <Flame size={14} className="text-orange-400" />
                          <span>{habit.streak} day streak</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{habit.frequency}</span>
                        </div>
                        {habit.time && (
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{habit.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-red-400">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Weekly Streak View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">This Week</h3>
            <Award size={20} className="text-yellow-400" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const completed = index < 4;
              return (
                <div key={day} className="text-center">
                  <p className="text-xs text-white/60 mb-2">{day}</p>
                  <div
                    className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                      completed
                        ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                        : index === 4
                        ? 'bg-gradient-to-br from-blue-500 to-violet-500 ring-2 ring-blue-400'
                        : 'bg-white/5'
                    }`}
                  >
                    {completed && <Check size={18} className="text-white" />}
                    {index === 4 && <Target size={18} className="text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
