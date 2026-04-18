import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { Bell, Lock, Palette, Globe, HelpCircle } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { ReminderType, SettingsResponse } from '@/lib/types';

const reminderTypeLabels: Record<ReminderType, string> = {
  workout: 'Workout',
  hydration: 'Hydration',
  'mood-check': 'Mood Check',
  journal: 'Journal',
  'quit-support': 'Quit Support',
  sleep: 'Sleep',
};

export function SettingsPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [settingsForm, setSettingsForm] = useState({
    coachPersonality: '',
    wakeTime: '07:00',
    sleepTime: '22:00',
    workoutTime: '08:00',
    reminderTime: '20:00',
    reminderSettings: [] as SettingsResponse['settings']['reminderSettings'],
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await apiFetch<SettingsResponse>('/settings');
      setData(response);
      setSettingsForm({
        coachPersonality: response.settings.coachPersonality,
        wakeTime: response.settings.routine.wakeTime,
        sleepTime: response.settings.routine.sleepTime,
        workoutTime: response.settings.routine.workoutTime,
        reminderTime: response.settings.routine.reminderTime,
        reminderSettings: response.settings.reminderSettings,
      });
      setError('');
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to load settings right now.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch<SettingsResponse>('/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          coachPersonality: settingsForm.coachPersonality.trim(),
          routine: {
            wakeTime: settingsForm.wakeTime,
            sleepTime: settingsForm.sleepTime,
            workoutTime: settingsForm.workoutTime,
            reminderTime: settingsForm.reminderTime,
          },
          reminderSettings: settingsForm.reminderSettings.map((reminder) => ({
            type: reminder.type,
            enabled: reminder.enabled,
            time: reminder.time,
          })),
        }),
      });

      setData(response);
      setSettingsForm({
        coachPersonality: response.settings.coachPersonality,
        wakeTime: response.settings.routine.wakeTime,
        sleepTime: response.settings.routine.sleepTime,
        workoutTime: response.settings.routine.workoutTime,
        reminderTime: response.settings.routine.reminderTime,
        reminderSettings: response.settings.reminderSettings,
      });
      setSuccess('Settings saved successfully.');
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to save settings right now.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setPasswordSaving(true);
    setError('');
    setPasswordSuccess('');

    try {
      await apiFetch<{ message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordForm),
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordSuccess('Password updated successfully.');
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to update password right now.');
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setError('Enter your password before deleting your account.');
      return;
    }

    const confirmed = window.confirm('Delete your RiseUp account permanently? This removes your progress, plans, reminders, and chat history.');

    if (!confirmed) {
      return;
    }

    setDeleteSaving(true);
    setError('');
    setSuccess('');
    setPasswordSuccess('');

    try {
      await apiFetch<{ message: string }>('/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword }),
      });

      setUser(null);
      navigate('/', { replace: true });
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to delete your account right now.');
      }
    } finally {
      setDeleteSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-white/60">Customize your experience</p>
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

        {passwordSuccess ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {passwordSuccess}
          </div>
        ) : null}

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex items-center space-x-4 mb-5">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                <Bell size={24} className="text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Notifications</h3>
                <p className="text-white/60 text-sm">Manage your reminder preferences</p>
              </div>
            </div>
            <div className="space-y-3">
              {settingsForm.reminderSettings.map((reminder) => (
                <div key={reminder.type} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{reminderTypeLabels[reminder.type]}</p>
                      <p className="text-sm text-white/55">{reminder.title}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={reminder.enabled}
                        onChange={(event) =>
                          setSettingsForm((current) => ({
                            ...current,
                            reminderSettings: current.reminderSettings.map((item) =>
                              item.type === reminder.type ? { ...item, enabled: event.target.checked } : item,
                            ),
                          }))
                        }
                      />
                      <span className="text-white/75">{reminder.enabled ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-white/55 mb-2">Reminder Time</label>
                    <input
                      type="time"
                      value={reminder.time}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          reminderSettings: current.reminderSettings.map((item) =>
                            item.type === reminder.type ? { ...item, time: event.target.value } : item,
                          ),
                        }))
                      }
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              ))}
              {loading ? <p className="text-sm text-white/50">Loading reminder settings...</p> : null}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="w-full p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex items-center space-x-4 mb-5">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                <Globe size={24} className="text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Routine Preferences</h3>
                <p className="text-white/60 text-sm">Save your core timing preferences</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'wakeTime', label: 'Wake Time' },
                { key: 'sleepTime', label: 'Sleep Time' },
                { key: 'workoutTime', label: 'Workout Time' },
                { key: 'reminderTime', label: 'Daily Reminder' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-white/55 mb-2">{field.label}</label>
                  <input
                    type="time"
                    value={settingsForm[field.key as keyof typeof settingsForm] as string}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex items-center space-x-4 mb-5">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                <Palette size={24} className="text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI Coach Style</h3>
                <p className="text-white/60 text-sm">Choose how your coach should sound</p>
              </div>
            </div>
            <input
              value={settingsForm.coachPersonality}
              onChange={(event) =>
                setSettingsForm((current) => ({ ...current, coachPersonality: event.target.value }))
              }
              placeholder="Supportive, direct, calm"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex items-center space-x-4 mb-5">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                <Lock size={24} className="text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Privacy & Security</h3>
                <p className="text-white/60 text-sm">Update your password securely</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                }
                placeholder="Current password"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                }
                placeholder="New password"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                placeholder="Confirm new password"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={() => {
                  void handleChangePassword();
                }}
                disabled={passwordSaving}
                className="rounded-lg bg-white/10 hover:bg-white/15 px-4 py-3 text-sm font-medium disabled:opacity-60"
              >
                {passwordSaving ? 'Updating Password...' : 'Change Password'}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex items-center space-x-4 mb-5">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                <HelpCircle size={24} className="text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Help & Support</h3>
                <p className="text-white/60 text-sm">Need help? Start with the reminders, mood, and journal tools.</p>
              </div>
            </div>
            <button
              onClick={() => {
                void handleSaveSettings();
              }}
              disabled={saving || loading}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-3 text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-red-900/20 border border-red-500/30"
        >
          <h3 className="font-semibold text-red-400 mb-2">Danger Zone</h3>
          <p className="text-white/60 text-sm mb-4">Irreversible actions. Enter your current password to confirm account deletion.</p>
          <div className="grid grid-cols-1 gap-3 md:max-w-md">
            <input
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              placeholder="Current password to confirm deletion"
              className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
            />
            <button
              onClick={() => {
                void handleDeleteAccount();
              }}
              disabled={deleteSaving}
              className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors text-red-300 disabled:opacity-60"
            >
              {deleteSaving ? 'Deleting Account...' : 'Delete Account'}
            </button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
