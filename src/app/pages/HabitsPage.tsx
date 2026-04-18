import { useEffect, useState } from 'react';
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
  TrendingUp,
  Award,
  X,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { Habit, HabitsResponse } from '@/lib/types';

const emptyHabitForm = {
  name: '',
  category: 'physical',
  difficulty: 'medium',
  frequency: 'Daily',
  scheduledTime: '',
  fallbackTask: '',
};

const categoryColors = {
  physical: { bg: 'from-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
  mental: { bg: 'from-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
  emotional: { bg: 'from-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  discipline: { bg: 'from-violet-500/20', border: 'border-violet-500/30', text: 'text-violet-400' },
  recovery: { bg: 'from-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
};

export function HabitsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [form, setForm] = useState(emptyHabitForm);
  const [data, setData] = useState<HabitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadHabits();
  }, []);

  async function loadHabits() {
    setError('');

    try {
      const response = await apiFetch<HabitsResponse>('/habits');
      setData(response);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to load habits right now');
      }
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingHabit(null);
    setForm(emptyHabitForm);
    setShowHabitModal(true);
  }

  function openEditModal(habit: Habit) {
    setEditingHabit(habit);
    setForm({
      name: habit.name,
      category: habit.category,
      difficulty: habit.difficulty,
      frequency: habit.frequency,
      scheduledTime: habit.time ?? '',
      fallbackTask: habit.fallbackTask ?? '',
    });
    setShowHabitModal(true);
  }

  async function handleSubmitHabit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingHabit) {
        await apiFetch(`/habits/${editingHabit.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/habits', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }

      setShowHabitModal(false);
      setEditingHabit(null);
      setForm(emptyHabitForm);
      await loadHabits();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to save this habit right now');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleHabit(habitId: string) {
    try {
      await apiFetch(`/habits/${habitId}/log`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      await loadHabits();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to update this habit right now');
      }
    }
  }

  async function handleDeleteHabit(habitId: string) {
    try {
      await apiFetch(`/habits/${habitId}`, {
        method: 'DELETE',
      });
      await loadHabits();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to delete this habit right now');
      }
    }
  }

  const habits = data?.habits ?? [];
  const filteredHabits = habits.filter((habit) => filter === 'all' || habit.category === filter);
  const stats = data?.stats ?? {
    completedCount: 0,
    totalCount: 0,
    completionPercentage: 0,
    longestStreak: 0,
    activeCount: 0,
    weekRate: 0,
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Habits</h1>
            <p className="text-white/60">Build consistency, one day at a time</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
          >
            <Plus size={20} />
            <span>Add Habit</span>
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 to-violet-900/20 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <Target size={24} className="text-blue-400" />
              <span className="text-3xl font-bold">
                {stats.completedCount}/{stats.totalCount}
              </span>
            </div>
            <p className="text-white/60 text-sm">Today's Progress</p>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-orange-900/30 to-amber-900/20 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <Flame size={24} className="text-orange-400" />
              <span className="text-3xl font-bold">{stats.longestStreak}</span>
            </div>
            <p className="text-white/60 text-sm">Longest Streak</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-green-900/20 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar size={24} className="text-emerald-400" />
              <span className="text-3xl font-bold">{stats.activeCount}</span>
            </div>
            <p className="text-white/60 text-sm">Active Habits</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} className="text-violet-400" />
              <span className="text-3xl font-bold">{stats.weekRate}%</span>
            </div>
            <p className="text-white/60 text-sm">This Week</p>
          </motion.div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Filter size={18} className="text-white/60 flex-shrink-0" />
          {['all', 'physical', 'mental', 'emotional', 'discipline', 'recovery'].map((nextFilter) => (
            <button
              key={nextFilter}
              onClick={() => setFilter(nextFilter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                filter === nextFilter
                  ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white border border-blue-500/30'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {nextFilter.charAt(0).toUpperCase() + nextFilter.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-white/70">Loading habits...</div>
        ) : (
          <div className="space-y-3">
            {filteredHabits.map((habit, index) => (
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
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => void handleToggleHabit(habit.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        habit.completed
                          ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/25'
                          : 'border-white/30 hover:border-blue-500'
                      }`}
                    >
                      {habit.completed && <Check size={16} className="text-white" />}
                    </button>

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
                            categoryColors[habit.category as keyof typeof categoryColors].bg
                          } ${
                            categoryColors[habit.category as keyof typeof categoryColors].text
                          } ${
                            categoryColors[habit.category as keyof typeof categoryColors].border
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

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(habit)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => void handleDeleteHabit(habit.id)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredHabits.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900/40 px-6 py-12 text-center text-white/60">
                No habits match this filter yet.
              </div>
            )}
          </div>
        )}

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
            {(data?.week ?? []).map((day, index) => (
              <div key={day.label} className="text-center">
                <p className="text-xs text-white/60 mb-2">{day.label}</p>
                <div
                  className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                    day.completed
                      ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                      : index === 6
                      ? 'bg-gradient-to-br from-blue-500 to-violet-500 ring-2 ring-blue-400'
                      : 'bg-white/5'
                  }`}
                >
                  {day.completed && <Check size={18} className="text-white" />}
                  {!day.completed && index === 6 && <Target size={18} className="text-white" />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showHabitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleSubmitHabit}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-950/95 p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {editingHabit ? 'Edit Habit' : 'Add Habit'}
                  </h3>
                  <p className="text-white/60 text-sm">Keep the existing structure. Just make it yours.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHabitModal(false)}
                  className="rounded-full p-2 hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-white/70">Habit name</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-blue-500/50"
                    placeholder="Morning walk"
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/70">Category</span>
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500/50"
                  >
                    <option value="physical">Physical</option>
                    <option value="mental">Mental</option>
                    <option value="emotional">Emotional</option>
                    <option value="discipline">Discipline</option>
                    <option value="recovery">Recovery</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/70">Difficulty</span>
                  <select
                    value={form.difficulty}
                    onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500/50"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/70">Frequency</span>
                  <input
                    value={form.frequency}
                    onChange={(event) => setForm({ ...form, frequency: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-blue-500/50"
                    placeholder="Daily"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/70">Time</span>
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(event) => setForm({ ...form, scheduledTime: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-blue-500/50"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/70">Fallback task</span>
                  <input
                    value={form.fallbackTask}
                    onChange={(event) => setForm({ ...form, fallbackTask: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-blue-500/50"
                    placeholder="5 minute stretch"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowHabitModal(false)}
                  className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingHabit ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
