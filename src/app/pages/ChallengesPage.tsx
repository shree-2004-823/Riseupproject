import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { useNavigate } from 'react-router';
import { apiFetch, ApiError } from '@/lib/api';
import type { ChallengesResponse, ChallengeListItem, JoinChallengeResponse } from '@/lib/types';

const challengeAppearance: Record<
  ChallengeListItem['type'],
  { badge: string; gradient: string; border: string }
> = {
  no_smoking: {
    badge: 'No',
    gradient: 'from-red-900/30 to-orange-900/20',
    border: 'border-red-500/30',
  },
  workout: {
    badge: 'Fit',
    gradient: 'from-orange-900/30 to-amber-900/20',
    border: 'border-orange-500/30',
  },
  hydration: {
    badge: 'H2O',
    gradient: 'from-sky-900/30 to-cyan-900/20',
    border: 'border-sky-500/30',
  },
  mood_checkin: {
    badge: 'Mood',
    gradient: 'from-emerald-900/30 to-teal-900/20',
    border: 'border-emerald-500/30',
  },
  journal: {
    badge: 'Write',
    gradient: 'from-emerald-900/30 to-teal-900/20',
    border: 'border-emerald-500/30',
  },
  recovery: {
    badge: 'Rise',
    gradient: 'from-violet-900/30 to-purple-900/20',
    border: 'border-violet-500/30',
  },
};

function getDifficultyClass(difficulty: ChallengeListItem['difficulty']) {
  if (difficulty === 'hard') {
    return 'bg-red-500/20 text-red-400';
  }

  if (difficulty === 'medium') {
    return 'bg-yellow-500/20 text-yellow-400';
  }

  return 'bg-green-500/20 text-green-400';
}

function getButtonLabel(challenge: ChallengeListItem) {
  if (!challenge.joined) {
    return 'Join Challenge';
  }

  if (challenge.completionStatus === 'completed') {
    return 'Completed';
  }

  if (challenge.completionStatus === 'expired') {
    return 'Challenge Ended';
  }

  return 'Continue';
}

export function ChallengesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ChallengesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningId, setJoiningId] = useState('');

  useEffect(() => {
    void loadChallenges();
  }, []);

  async function loadChallenges() {
    try {
      const response = await apiFetch<ChallengesResponse>('/challenges');
      setData(response);
      setError('');
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to load challenges right now.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinChallenge(id: string) {
    setJoiningId(id);
    setError('');

    try {
      const response = await apiFetch<JoinChallengeResponse>(`/challenges/${id}/join`, {
        method: 'POST',
      });

      setData((current) => ({
        challenges:
          current?.challenges.map((challenge) =>
            challenge.id === response.challenge.id ? response.challenge : challenge,
          ) ?? [response.challenge],
      }));
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to join this challenge right now.');
      }
    } finally {
      setJoiningId('');
    }
  }

  const joinedCount = useMemo(
    () => (data?.challenges ?? []).filter((challenge) => challenge.joined).length,
    [data],
  );
  const completedCount = useMemo(
    () =>
      (data?.challenges ?? []).filter((challenge) => challenge.completionStatus === 'completed').length,
    [data],
  );

  function continueChallenge(challenge: ChallengeListItem) {
    if (challenge.type === 'no_smoking' || challenge.type === 'recovery') {
      navigate('/quit-support');
      return;
    }

    if (challenge.type === 'mood_checkin') {
      navigate('/mood');
      return;
    }

    if (challenge.type === 'journal') {
      navigate('/journal');
      return;
    }

    navigate('/habits');
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Challenges</h1>
          <p className="text-white/60">Push yourself with structured goals</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="h-[288px] rounded-2xl border border-white/10 bg-zinc-900/50 animate-pulse"
                />
              ))
            : null}

          {(data?.challenges ?? []).map((challenge, index) => {
            const appearance = challengeAppearance[challenge.type];

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${appearance.gradient} border ${appearance.border} backdrop-blur-xl hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-base font-semibold tracking-[0.2em] uppercase text-white/75">{appearance.badge}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyClass(challenge.difficulty)}`}>
                    {challenge.difficulty[0].toUpperCase() + challenge.difficulty.slice(1)}
                  </span>
                </div>

                <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                <p className="text-sm text-white/60 mb-4 min-h-10">{challenge.description}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/60">Progress</span>
                    <span className="font-semibold">{challenge.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${challenge.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <p className="text-white/60 text-sm">{challenge.timeLabel}</p>
                <p className="text-white/45 text-xs mt-2">
                  {challenge.daysCompleted}/{challenge.durationDays} days completed
                </p>
                {challenge.rewardBadgeText ? (
                  <p className="text-white/55 text-xs mt-2">Reward: {challenge.rewardBadgeText}</p>
                ) : null}

                <button
                  onClick={() => {
                    if (!challenge.joined) {
                      void handleJoinChallenge(challenge.id);
                      return;
                    }

                    continueChallenge(challenge);
                  }}
                  disabled={
                    joiningId === challenge.id ||
                    challenge.completionStatus === 'completed' ||
                    challenge.completionStatus === 'expired'
                  }
                  className={`w-full py-3 rounded-xl font-medium transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed ${
                    !challenge.joined
                      ? 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {joiningId === challenge.id ? 'Joining...' : getButtonLabel(challenge)}
                </button>
              </motion.div>
            );
          })}
        </div>

        {!loading && (data?.challenges.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 px-6 py-10 text-center text-white/60">
            No active challenges are available right now.
          </div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border border-yellow-500/30 text-center"
        >
          <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Complete challenges to earn badges!</h3>
          <p className="text-white/60 mb-4">
            {loading
              ? 'Loading your challenge progress...'
              : `${joinedCount} joined, ${completedCount} completed`}
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
