import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Save } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { apiFetch, ApiError } from '@/lib/api';
import type { JournalResponse, JournalSaveResponse } from '@/lib/types';

const emotionOptions = ['calm', 'grateful', 'stressed', 'motivated', 'tired', 'hopeful', 'frustrated'];

export function JournalPage() {
  const [entry, setEntry] = useState('');
  const [emotionTag, setEmotionTag] = useState('');
  const [data, setData] = useState<JournalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    void apiFetch<JournalResponse>('/journal')
      .then((response) => {
        setData(response);
      })
      .catch((requestError) => {
        if (requestError instanceof ApiError) {
          setError(requestError.message);
        } else {
          setError('Unable to load journal history.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const latestEntry = data?.entries[0] ?? null;
  const totalEntries = data?.entries.length ?? 0;
  const currentMonthCount = useMemo(() => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();

    return (data?.entries ?? []).filter((journalEntry) => {
      const date = new Date(journalEntry.createdAt);
      return date.getMonth() === month && date.getFullYear() === year;
    }).length;
  }, [data]);

  const handleSave = async () => {
    if (!entry.trim()) {
      setError('Write a few lines before saving.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch<JournalSaveResponse>('/journal', {
        method: 'POST',
        body: JSON.stringify({
          content: entry.trim(),
          emotionTag: emotionTag || undefined,
        }),
      });

      setEntry('');
      setEmotionTag('');
      setSuccess('Journal entry saved.');
      setData((current) => ({
        entries: [response.entry, ...(current?.entries ?? [])].slice(0, 20),
      }));
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to save your journal entry right now.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Journal</h1>
          <p className="text-white/60">Capture your thoughts, feelings, and patterns in one place</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
            >
              <h3 className="font-semibold mb-4">New Entry</h3>
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Write about your day, what you felt, what helped, and what you learned."
                className="w-full h-80 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />

              <div className="mt-4">
                <label className="block text-sm text-white/60 mb-2">Emotion Tag</label>
                <div className="flex flex-wrap gap-2">
                  {emotionOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setEmotionTag((current) => (current === option ? '' : option))}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        emotionTag === option
                          ? 'border-blue-500/40 bg-blue-500/15 text-blue-200'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  <span>{saving ? 'Saving...' : 'Save Entry'}</span>
                </button>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border border-amber-500/30"
            >
              <BookOpen size={24} className="text-amber-400 mb-3" />
              <p className="text-white/60 text-sm mb-1">Journal Activity</p>
              <p className="text-3xl font-bold mb-2">{loading ? '--' : totalEntries}</p>
              <p className="text-amber-400 text-sm">{currentMonthCount} entries this month</p>
              <div className="mt-4 rounded-lg bg-black/20 border border-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">Latest Emotion</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  {latestEntry?.emotionTag ?? 'Add an emotion tag to reveal patterns over time.'}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
            >
              <h3 className="font-semibold mb-4">Recent Entries</h3>
              <div className="space-y-3">
                {(data?.entries ?? []).slice(0, 5).map((recentEntry) => (
                  <div key={recentEntry.id} className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-white/40">
                        {new Date(recentEntry.createdAt).toLocaleString()}
                      </div>
                      {recentEntry.emotionTag ? (
                        <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-200">
                          {recentEntry.emotionTag}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-white/75 mt-2 line-clamp-4">{recentEntry.content}</p>
                  </div>
                ))}
                {!loading && (data?.entries.length ?? 0) === 0 ? (
                  <p className="text-sm text-white/50">No entries yet. Your first reflection starts here.</p>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
