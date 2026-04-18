import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout';
import { apiFetch, ApiError } from '@/lib/api';
import type { CommunityResponse } from '@/lib/types';

export function CommunityPage() {
  const [data, setData] = useState<CommunityResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void apiFetch<CommunityResponse>('/community')
      .then((response) => {
        setData(response);
        setError('');
      })
      .catch((requestError) => {
        if (requestError instanceof ApiError) {
          setError(requestError.message);
        } else {
          setError('Unable to load the community hub right now.');
        }
      });
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community</h1>
          <p className="text-white/60">See the bigger picture, find challenge momentum, and stay accountable without losing your own pace.</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/30"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-4 py-2 text-sm font-semibold text-violet-200">
                <HeartHandshake size={16} />
                Community momentum
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">You are building alongside other people who are showing up today.</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                RiseUp keeps this space private and practical. Instead of noisy feeds, you get a grounded snapshot of shared momentum, challenge energy, and the support principles that help people stay in the game.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: 'Members', value: data?.summary.totalMembers ?? 0 },
                { label: 'Active Today', value: data?.summary.activeToday ?? 0 },
                { label: 'Habit Wins', value: data?.summary.habitWinsToday ?? 0 },
                { label: 'Mood Check-ins', value: data?.summary.moodCheckInsToday ?? 0 },
                { label: 'Resisted Cravings', value: data?.summary.resistedCravingsToday ?? 0 },
                { label: 'Journal Entries', value: data?.summary.journalEntriesToday ?? 0 },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Challenge Spotlight</h3>
                <p className="text-sm text-white/55">The strongest accountability paths in the app right now.</p>
              </div>
              <Users className="text-violet-300" size={22} />
            </div>

            <div className="space-y-4">
              {(data?.spotlightChallenges ?? []).map((challenge) => (
                <div key={challenge.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium text-white">{challenge.title}</h4>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
                          {challenge.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white/60">{challenge.description}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70 capitalize">
                      {challenge.difficulty}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-lg bg-white/5 px-3 py-3">
                      <p className="text-white/40">Active now</p>
                      <p className="mt-1 font-semibold text-white">{challenge.activeParticipants}</p>
                    </div>
                    <div className="rounded-lg bg-white/5 px-3 py-3">
                      <p className="text-white/40">Completed</p>
                      <p className="mt-1 font-semibold text-white">{challenge.completedParticipants}</p>
                    </div>
                    <Link
                      to="/challenges"
                      className="group rounded-lg border border-white/10 bg-white/5 px-3 py-3 transition-colors hover:bg-white/10"
                    >
                      <p className="text-white/40">Open</p>
                      <p className="mt-1 inline-flex items-center gap-2 font-semibold text-white">
                        View challenges
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </p>
                    </Link>
                  </div>
                </div>
              ))}

              {!error && !data ? <div className="text-sm text-white/50">Loading community momentum...</div> : null}
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <Sparkles className="text-blue-300" size={22} />
                <div>
                  <h3 className="text-lg font-semibold">Your Momentum</h3>
                  <p className="text-sm text-white/55">A private snapshot of how you are showing up inside the app.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Joined</p>
                  <p className="mt-2 text-2xl font-semibold">{data?.personalMomentum.joinedCount ?? 0}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Active</p>
                  <p className="mt-2 text-2xl font-semibold">{data?.personalMomentum.activeCount ?? 0}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Completed</p>
                  <p className="mt-2 text-2xl font-semibold">{data?.personalMomentum.completedCount ?? 0}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Best Progress</p>
                  <p className="mt-2 text-2xl font-semibold">{data?.personalMomentum.bestProgressPercentage ?? 0}%</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-4 text-sm text-blue-100">
                <span className="font-semibold">Best challenge:</span>{' '}
                {data?.personalMomentum.bestChallengeTitle ?? 'Join a challenge to start building momentum.'}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="text-emerald-300" size={22} />
                <div>
                  <h3 className="text-lg font-semibold">Support Principles</h3>
                  <p className="text-sm text-white/55">The tone we keep inside RiseUp.</p>
                </div>
              </div>
              <div className="space-y-3">
                {(data?.supportPrinciples ?? []).map((principle) => (
                  <div key={principle} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/75">
                    {principle}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
