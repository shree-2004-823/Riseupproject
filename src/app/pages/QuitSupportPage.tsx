import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { Ban, TrendingUp, AlertCircle, Heart } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { QuitSupportResponse } from '@/lib/types';

const intensityLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export function QuitSupportPage() {
  const [data, setData] = useState<QuitSupportResponse | null>(null);
  const [trigger, setTrigger] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  useEffect(() => {
    void loadQuitSupport();
  }, []);

  async function loadQuitSupport() {
    try {
      const response = await apiFetch<QuitSupportResponse>('/quit-support');
      setData(response);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to load quit-support data right now');
      }
    } finally {
      setLoading(false);
    }
  }

  async function logCraving(outcome: 'resisted' | 'relapsed' | 'support_requested') {
    setSaving(true);
    setError('');

    try {
      const response = await apiFetch<{ supportMessage: string }>('/cravings', {
        method: 'POST',
        body: JSON.stringify({
          habitType: 'smoking',
          trigger: trigger || undefined,
          intensity,
          notes: notes || undefined,
          outcome,
        }),
      });

      setSupportMessage(response.supportMessage);
      setTrigger('');
      setNotes('');
      setIntensity(5);
      await loadQuitSupport();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Unable to log this craving right now');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quit Support</h1>
          <p className="text-white/60">Your safe space for recovery</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-green-900/20 border border-emerald-500/30"
          >
            <Ban size={32} className="text-emerald-400 mb-4" />
            <p className="text-white/60 text-sm mb-1">Smoke-Free</p>
            <p className="text-4xl font-bold mb-2">
              {loading ? '--' : `${data?.currentSmokeFreeStreak ?? 0} days`}
            </p>
            <p className="text-emerald-400 text-sm">Keep going strong!</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-orange-900/30 to-amber-900/20 border border-orange-500/30"
          >
            <TrendingUp size={32} className="text-orange-400 mb-4" />
            <p className="text-white/60 text-sm mb-1">Cravings Today</p>
            <p className="text-4xl font-bold mb-2">{loading ? '--' : data?.cravingsToday ?? 0}</p>
            <p className="text-orange-400 text-sm">
              {loading ? 'Loading...' : `${data?.urgesResistedToday ?? 0} resisted`}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/30"
          >
            <Heart size={32} className="text-violet-400 mb-4" />
            <p className="text-white/60 text-sm mb-1">Money Saved</p>
            <p className="text-4xl font-bold mb-2">${loading ? '--' : data?.moneySaved ?? 0}</p>
            <p className="text-violet-400 text-sm">
              {data?.topTrigger ? `Top trigger: ${data.topTrigger}` : 'Every resistant urge counts'}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-red-900/20 to-orange-900/10 border border-red-500/20"
        >
          <AlertCircle size={24} className="text-red-400 mb-3" />
          <h3 className="text-xl font-semibold mb-3">Emergency Support</h3>
          <p className="text-white/70 mb-6">
            If you're feeling an urge right now, you're not alone. Take a deep breath.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => void logCraving('resisted')}
              disabled={saving}
              className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all text-center disabled:opacity-60"
            >
              <p className="font-semibold">I feel like smoking</p>
              <p className="text-sm text-white/60 mt-1">Log the urge and resist it</p>
            </button>
            <button
              onClick={() => void logCraving('relapsed')}
              disabled={saving}
              className="px-6 py-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl transition-all text-center disabled:opacity-60"
            >
              <p className="font-semibold">I'm about to relapse</p>
              <p className="text-sm text-white/60 mt-1">Record the slip without judgment</p>
            </button>
            <button
              onClick={() => void logCraving('support_requested')}
              disabled={saving}
              className="px-6 py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl transition-all text-center disabled:opacity-60"
            >
              <p className="font-semibold">I need motivation</p>
              <p className="text-sm text-white/60 mt-1">Ask for a supportive reset</p>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
        >
          <h3 className="font-semibold text-lg mb-4">Log an urge with context</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-2">
              <span className="text-sm text-white/70">Trigger</span>
              <input
                value={trigger}
                onChange={(event) => setTrigger(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-blue-500/50"
                placeholder="Stress, coffee, break time..."
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/70">Intensity</span>
              <select
                value={intensity}
                onChange={(event) => setIntensity(parseInt(event.target.value, 10))}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500/50"
              >
                {intensityLabels.map((label) => (
                  <option key={label} value={label}>
                    {label}/10
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 md:col-span-1">
              <span className="text-sm text-white/70">Notes</span>
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-blue-500/50"
                placeholder="What helped? What made it harder?"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => void logCraving('resisted')}
              disabled={saving}
              className="px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-60"
            >
              Log as resisted
            </button>
            <button
              onClick={() => void logCraving('support_requested')}
              disabled={saving}
              className="px-4 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-60"
            >
              Log and ask for support
            </button>
          </div>

          {supportMessage && (
            <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
              {supportMessage}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
        >
          <h3 className="font-semibold text-lg mb-4">Recent craving logs</h3>
          <div className="space-y-3">
            {(data?.recentLogs ?? []).map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <p className="font-medium capitalize">{log.outcome.replace('_', ' ')}</p>
                  <p className="text-sm text-white/60">
                    {log.trigger ? `Trigger: ${log.trigger}` : 'No trigger added'}
                  </p>
                </div>
                <div className="text-sm text-white/60">
                  {log.intensity ? `Intensity ${log.intensity}/10` : 'No intensity'}
                </div>
              </div>
            ))}

            {!loading && (data?.recentLogs.length ?? 0) === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-white/60">
                No craving logs yet. Your first logged urge will show up here.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
