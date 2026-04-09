import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';

export function CommunityPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community</h1>
          <p className="text-white/60">Connect with others on their journey</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/30 text-center"
        >
          <Users size={64} className="text-violet-400 mx-auto mb-6" />
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-500/20 rounded-full mb-4">
            <span className="text-sm font-semibold text-violet-300">Coming Soon</span>
          </div>
          <h3 className="text-2xl font-bold mb-3">Community Features</h3>
          <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
            Connect with like-minded individuals, share your progress, find accountability partners, 
            and participate in group challenges. Build a supportive network on your self-improvement journey.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
