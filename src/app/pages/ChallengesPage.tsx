import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { Trophy, Target, Flame, Heart } from 'lucide-react';

const challenges = [
  {
    title: '7 Days No Smoking',
    progress: 57,
    difficulty: 'Hard',
    timeLeft: '3 days left',
    badge: '🚭',
    gradient: 'from-red-900/30 to-orange-900/20',
    border: 'border-red-500/30',
  },
  {
    title: '14 Day Workout Reset',
    progress: 71,
    difficulty: 'Medium',
    timeLeft: '4 days left',
    badge: '💪',
    gradient: 'from-orange-900/30 to-amber-900/20',
    border: 'border-orange-500/30',
  },
  {
    title: '21 Day Discipline Sprint',
    progress: 33,
    difficulty: 'Hard',
    timeLeft: '14 days left',
    badge: '⚡',
    gradient: 'from-violet-900/30 to-purple-900/20',
    border: 'border-violet-500/30',
  },
  {
    title: '10 Days Sleep Recovery',
    progress: 0,
    difficulty: 'Easy',
    timeLeft: 'Not started',
    badge: '🌙',
    gradient: 'from-blue-900/30 to-indigo-900/20',
    border: 'border-blue-500/30',
  },
  {
    title: '30 Day Journaling',
    progress: 47,
    difficulty: 'Easy',
    timeLeft: '16 days left',
    badge: '📖',
    gradient: 'from-emerald-900/30 to-teal-900/20',
    border: 'border-emerald-500/30',
  },
];

export function ChallengesPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Challenges</h1>
          <p className="text-white/60">Push yourself with structured goals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${challenge.gradient} border ${challenge.border} backdrop-blur-xl hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{challenge.badge}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  challenge.difficulty === 'Hard'
                    ? 'bg-red-500/20 text-red-400'
                    : challenge.difficulty === 'Medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
              
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/60">Progress</span>
                  <span className="font-semibold">{challenge.progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${challenge.progress}%` }}
                  />
                </div>
              </div>

              <p className="text-white/60 text-sm mb-4">{challenge.timeLeft}</p>

              <button className={`w-full py-3 rounded-xl font-medium transition-all ${
                challenge.progress === 0
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600'
                  : 'bg-white/10 hover:bg-white/20'
              }`}>
                {challenge.progress === 0 ? 'Join Challenge' : 'Continue'}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border border-yellow-500/30 text-center"
        >
          <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Complete challenges to earn badges!</h3>
          <p className="text-white/60 mb-4">Track your achievements and stay motivated</p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
