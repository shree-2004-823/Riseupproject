import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Award, Target, TrendingUp } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { ProfileResponse } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export function ProfilePage() {
  const { refresh } = useAuth();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    coachPersonality: '',
    goalsText: '',
  });

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await apiFetch<ProfileResponse>('/profile');
      setData(response);
      setForm({
        fullName: response.profile.fullName,
        coachPersonality: response.profile.coachPersonality,
        goalsText: response.profile.goals.join(', '),
      });
      setError('');
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to load profile right now.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch<ProfileResponse>('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          coachPersonality: form.coachPersonality.trim(),
          goals: form.goalsText
            .split(',')
            .map((goal) => goal.trim())
            .filter(Boolean),
        }),
      });

      setData(response);
      setForm({
        fullName: response.profile.fullName,
        coachPersonality: response.profile.coachPersonality,
        goalsText: response.profile.goals.join(', '),
      });
      setSuccess('Profile updated successfully.');
      setEditing(false);
      await refresh();
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to save your profile right now.');
      }
    } finally {
      setSaving(false);
    }
  }

  const initials = useMemo(() => {
    const source = data?.profile.fullName ?? form.fullName;
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';
  }, [data, form.fullName]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-white/60">Your journey at a glance</p>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-4xl font-bold mb-4">
                {loading ? '--' : initials}
              </div>
              <h2 className="text-2xl font-bold mb-1">{loading ? 'Loading...' : data?.profile.fullName}</h2>
              <p className="text-white/60 text-sm mb-4">{loading ? 'Loading...' : data?.profile.email}</p>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-orange-500/20 rounded-full mb-4">
                <Award size={16} className="text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">
                  {loading ? '--' : `${data?.stats.currentStreak ?? 0} Day Streak`}
                </span>
              </div>
              <button
                onClick={() => setEditing((current) => !current)}
                className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                {editing ? 'Cancel Editing' : 'Edit Profile'}
              </button>

              {editing ? (
                <div className="w-full space-y-3 mt-4 text-left">
                  <div>
                    <label className="block text-xs text-white/55 mb-2">Full Name</label>
                    <input
                      value={form.fullName}
                      onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/55 mb-2">AI Coach Style</label>
                    <input
                      value={form.coachPersonality}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, coachPersonality: event.target.value }))
                      }
                      placeholder="Supportive, direct, calm"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <button
                    onClick={() => {
                      void handleSave();
                    }}
                    disabled={saving}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-medium disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10">
              <h3 className="font-semibold text-lg mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <User size={20} className="text-white/60" />
                  <div>
                    <p className="text-xs text-white/60">Full Name</p>
                    <p className="font-medium">{loading ? 'Loading...' : data?.profile.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <Mail size={20} className="text-white/60" />
                  <div>
                    <p className="text-xs text-white/60">Email</p>
                    <p className="font-medium">{loading ? 'Loading...' : data?.profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <Calendar size={20} className="text-white/60" />
                  <div>
                    <p className="text-xs text-white/60">Member Since</p>
                    <p className="font-medium">
                      {loading
                        ? 'Loading...'
                        : new Date(data?.profile.createdAt ?? '').toLocaleDateString(undefined, {
                            month: 'long',
                            year: 'numeric',
                          })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs text-white/60 mb-2">Goals & Preferences</p>
                {editing ? (
                  <textarea
                    value={form.goalsText}
                    onChange={(event) => setForm((current) => ({ ...current, goalsText: event.target.value }))}
                    className="w-full h-24 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Enter goals separated by commas"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(data?.profile.goals ?? []).length > 0 ? (
                      data?.profile.goals.map((goal) => (
                        <span
                          key={goal}
                          className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-200"
                        >
                          {goal}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-white/50">No goals saved yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 to-violet-900/20 border border-blue-500/30">
              <h3 className="font-semibold text-lg mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <Target size={20} className="text-blue-400 mb-2" />
                  <p className="text-white/60 text-xs mb-1">Total Habits</p>
                  <p className="text-2xl font-bold">{loading ? '--' : data?.stats.totalHabits}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <Award size={20} className="text-orange-400 mb-2" />
                  <p className="text-white/60 text-xs mb-1">Longest Streak</p>
                  <p className="text-2xl font-bold">{loading ? '--' : `${data?.stats.longestStreak} days`}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <TrendingUp size={20} className="text-emerald-400 mb-2" />
                  <p className="text-white/60 text-xs mb-1">This Week</p>
                  <p className="text-2xl font-bold">{loading ? '--' : `${data?.stats.weekCompletionRate}%`}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <Calendar size={20} className="text-violet-400 mb-2" />
                  <p className="text-white/60 text-xs mb-1">Check-Ins</p>
                  <p className="text-2xl font-bold">{loading ? '--' : `${data?.stats.moodCheckInStreak} days`}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
