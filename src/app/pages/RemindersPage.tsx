import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { AlertCircle, Bell, CheckCircle2, Plus } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { GeneratedReminder, ReminderType, RemindersResponse } from '@/lib/types';

const statusStyles: Record<GeneratedReminder['status'], string> = {
  due: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  missed: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  upcoming: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
};

const reminderTypeOptions: Array<{ value: ReminderType; label: string }> = [
  { value: 'workout', label: 'Workout' },
  { value: 'hydration', label: 'Hydration' },
  { value: 'mood-check', label: 'Mood Check' },
  { value: 'journal', label: 'Journal' },
  { value: 'quit-support', label: 'Quit Support' },
  { value: 'sleep', label: 'Sleep' },
];

const reminderTypeLabels = Object.fromEntries(reminderTypeOptions.map((option) => [option.value, option.label])) as Record<
  ReminderType,
  string
>;

export function RemindersPage() {
  const [data, setData] = useState<RemindersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    type: 'workout' as ReminderType,
    title: '',
    message: '',
    time: '20:00',
    habitId: '',
  });

  useEffect(() => {
    void loadReminders();
  }, []);

  async function loadReminders() {
    try {
      const response = await apiFetch<RemindersResponse>('/reminders');
      setData(response);
      setError('');
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to load reminders right now.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateReminder() {
    if (!form.title.trim()) {
      setError('Add a title for the reminder.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await apiFetch<RemindersResponse>('/reminders', {
        method: 'POST',
        body: JSON.stringify({
          type: form.type,
          title: form.title.trim(),
          message: form.message.trim() || undefined,
          time: form.time,
          habitId: form.habitId || undefined,
        }),
      });

      setData(response);
      setForm({
        type: 'workout',
        title: '',
        message: '',
        time: '20:00',
        habitId: '',
      });
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to save reminder.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleSchedule(id: string, enabled: boolean) {
    try {
      const response = await apiFetch<RemindersResponse>(`/reminders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: !enabled }),
      });
      setData(response);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to update reminder.');
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reminders</h1>
            <p className="text-white/60">Store reminder schedules, catch missed habits, and stay on track</p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-white/40">Enabled</div>
              <div className="text-xl font-semibold">{data?.summary.enabledCount ?? 0}</div>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
              <div className="text-amber-200/70">Missed</div>
              <div className="text-xl font-semibold text-amber-100">{data?.summary.missedCount ?? 0}</div>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
              <div className="text-blue-200/70">Due</div>
              <div className="text-xl font-semibold text-blue-100">{data?.summary.dueCount ?? 0}</div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold">Generated Reminders</h2>
            </div>
            <div className="space-y-3">
              {(data?.generated ?? []).map((reminder) => (
                <div key={reminder.id} className={`rounded-xl border px-4 py-4 ${statusStyles[reminder.status]}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{reminder.title}</div>
                      <div className="text-sm opacity-85 mt-1">{reminder.message}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs uppercase tracking-[0.2em] opacity-70">{reminder.status}</div>
                      <div className="font-semibold mt-1">{reminder.time}</div>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && (data?.generated.length ?? 0) === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
                  No due or missed reminders right now. Your active schedules will show up here when they need attention.
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Plus className="text-violet-400" size={20} />
              <h2 className="text-xl font-semibold">Add Reminder</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Type</label>
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as ReminderType,
                      habitId: event.target.value === 'workout' ? current.habitId : '',
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {reminderTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {form.type === 'workout' ? (
                <div>
                  <label className="block text-sm text-white/60 mb-2">Related Habit (Optional)</label>
                  <select
                    value={form.habitId}
                    onChange={(event) => setForm((current) => ({ ...current, habitId: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Select a habit</option>
                    {(data?.availableHabits ?? []).map((habit) => (
                      <option key={habit.id} value={habit.id}>
                        {habit.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="block text-sm text-white/60 mb-2">Title</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Evening habit reset"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Message</label>
                <textarea
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder="Optional coaching note for this reminder"
                  className="w-full h-24 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <button
                onClick={() => {
                  void handleCreateReminder();
                }}
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-3 text-sm font-medium transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Reminder'}
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
        >
          <h2 className="text-xl font-semibold mb-4">Reminder Schedules</h2>
          <div className="space-y-3">
            {(data?.schedules ?? []).map((schedule) => (
              <div
                key={schedule.id}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-medium">{schedule.title}</div>
                      <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em] text-white/50">
                      {reminderTypeLabels[schedule.type]}
                      </span>
                    {schedule.habitName ? (
                      <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-200">
                        {schedule.habitName}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-white/60 mt-1">
                    {schedule.message || `Daily reminder scheduled for ${schedule.time}.`}
                  </div>
                  <div className="text-xs text-white/35 mt-2">Scheduled at {schedule.time}</div>
                </div>
                <button
                  onClick={() => {
                    void handleToggleSchedule(schedule.id, schedule.enabled);
                  }}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
                    schedule.enabled
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : 'border border-white/10 bg-white/5 text-white/60'
                  }`}
                >
                  {schedule.enabled ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {schedule.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}

            {!loading && (data?.schedules.length ?? 0) === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
                No reminder schedules yet. Create one above to start generating reminders.
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
