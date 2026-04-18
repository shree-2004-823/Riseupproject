import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLayout } from '../components/layout/AppLayout';
import { Calendar, Zap, Battery, HeartPulse, Plus, Check, Clock, X, Trash2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { PlannerItem, PlannerResponse } from '@/lib/types';

type PlannerMode = 'normal' | 'low-energy' | 'recovery';

const emptyTaskForm = {
  title: '',
  period: 'morning',
  energyLevel: 'medium',
  scheduledTime: '',
  category: '',
};

function flattenPlannerItems(itemsByPeriod: PlannerResponse['itemsByPeriod']) {
  return Object.entries(itemsByPeriod).flatMap(([period, items]) =>
    items.map((item) => ({
      title: item.title,
      category: item.category ?? undefined,
      priority: item.priority ?? undefined,
      status: item.status,
      period,
      energyLevel: item.energyLevel,
      scheduledTime: item.time ?? undefined,
      fallbackTask: item.fallbackTask ?? undefined,
    })),
  );
}

export function PlannerPage() {
  const [planner, setPlanner] = useState<PlannerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);

  const modes = [
    { value: 'normal', label: 'Normal Mode', icon: Zap, color: 'from-blue-500 to-violet-500' },
    { value: 'low-energy', label: 'Low Energy Mode', icon: Battery, color: 'from-yellow-500 to-orange-500' },
    { value: 'recovery', label: 'Recovery Mode', icon: HeartPulse, color: 'from-emerald-500 to-teal-500' },
  ];

  useEffect(() => {
    void loadPlanner();
  }, []);

  async function loadPlanner() {
    try {
      const response = await apiFetch<PlannerResponse>('/planner');
      setPlanner(response);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to load planner data right now');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleModeChange(nextMode: PlannerMode) {
    if (!planner) return;

    try {
      const response = await apiFetch<PlannerResponse>('/planner', {
        method: 'POST',
        body: JSON.stringify({
          dateKey: planner.dateKey,
          mode: nextMode,
          items: flattenPlannerItems(planner.itemsByPeriod),
        }),
      });
      setPlanner(response);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to update planner mode right now');
      }
    }
  }

  async function toggleTask(item: PlannerItem) {
    try {
      await apiFetch('/planner/item', {
        method: 'PATCH',
        body: JSON.stringify({
          itemId: item.id,
          status: item.completed ? 'pending' : 'completed',
        }),
      });
      await loadPlanner();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to update this task right now');
      }
    }
  }

  async function handleAddTask(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await apiFetch('/planner/item', {
        method: 'POST',
        body: JSON.stringify(taskForm),
      });
      setShowTaskModal(false);
      setTaskForm(emptyTaskForm);
      await loadPlanner();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to add this task right now');
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(itemId: string) {
    try {
      await apiFetch(`/planner/item/${itemId}`, {
        method: 'DELETE',
      });
      await loadPlanner();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to delete this task right now');
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Daily Planner</h1>
            <p className="text-white/60">Plan realistically, not ideally</p>
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/30 backdrop-blur-xl"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Today's AI Focus</h3>
              <p className="text-white/80 text-sm mb-3">
                {planner?.aiInsight ?? "Loading today's plan..."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-xs text-orange-300 mb-1">Completed</p>
                  <p className="text-sm font-semibold">{planner?.totals?.completedCount ?? 0} tasks</p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-300 mb-1">Planned</p>
                  <p className="text-sm font-semibold">{planner?.totals?.totalCount ?? 0} tasks</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-xs text-emerald-300 mb-1">Mode</p>
                  <p className="text-sm font-semibold capitalize">{planner?.mode ?? 'normal'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.value}
                onClick={() => void handleModeChange(mode.value as PlannerMode)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all flex-shrink-0 ${
                  planner?.mode === mode.value
                    ? `bg-gradient-to-r ${mode.color} shadow-lg`
                    : 'bg-white/5 hover:bg-white/10 text-white/60'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-16 text-white/70">Loading planner...</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(planner?.itemsByPeriod ?? {}).map(([period, periodTasks], index) => (
              <motion.div
                key={period}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
              >
                <h3 className="font-semibold text-lg mb-4 capitalize">{period}</h3>
                <div className="space-y-3">
                  {periodTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        task.completed
                          ? 'bg-emerald-900/20 border border-emerald-500/30'
                          : 'bg-white/5 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <button
                          onClick={() => void toggleTask(task)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            task.completed
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-white/30 hover:border-blue-500'
                          }`}
                        >
                          {task.completed && <Check size={14} className="text-white" />}
                        </button>
                        <div className="flex-1">
                          <p className={`font-medium ${task.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            {task.time && (
                              <div className="flex items-center space-x-1 text-xs text-white/60">
                                <Clock size={12} />
                                <span>{task.time}</span>
                              </div>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                task.energyLevel === 'high'
                                  ? 'bg-red-500/20 text-red-400'
                                  : task.energyLevel === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-green-500/20 text-green-400'
                              }`}
                            >
                              {task.energyLevel} energy
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => void deleteTask(task.id)}
                        className="rounded-lg p-2 text-white/50 hover:text-red-400 hover:bg-white/5"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {periodTasks.length === 0 && (
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-white/60">
                      No tasks scheduled for this block yet.
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showTaskModal && (
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
              onSubmit={handleAddTask}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-950/95 p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">Add planner task</h3>
                  <p className="text-white/60 text-sm">Keep your existing planner UI, just make it persistent.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="rounded-full p-2 hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-white/70">Task title</span>
                  <input
                    value={taskForm.title}
                    onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-blue-500/50"
                    placeholder="Workout"
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/70">Time block</span>
                  <select
                    value={taskForm.period}
                    onChange={(event) => setTaskForm({ ...taskForm, period: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500/50"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/70">Energy level</span>
                  <select
                    value={taskForm.energyLevel}
                    onChange={(event) => setTaskForm({ ...taskForm, energyLevel: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/70">Scheduled time</span>
                  <input
                    type="time"
                    value={taskForm.scheduledTime}
                    onChange={(event) => setTaskForm({ ...taskForm, scheduledTime: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-blue-500/50"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm text-white/70">Category</span>
                  <input
                    value={taskForm.category}
                    onChange={(event) => setTaskForm({ ...taskForm, category: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-blue-500/50"
                    placeholder="Health, Study, Recovery..."
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Add Task'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

