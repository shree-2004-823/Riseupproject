import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { Ban, TrendingUp, AlertCircle, Heart } from 'lucide-react';

export function QuitSupportPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quit Support</h1>
          <p className="text-white/60">Your safe space for recovery</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-green-900/20 border border-emerald-500/30"
          >
            <Ban size={32} className="text-emerald-400 mb-4" />
            <p className="text-white/60 text-sm mb-1">Smoke-Free</p>
            <p className="text-4xl font-bold mb-2">14 days</p>
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
            <p className="text-4xl font-bold mb-2">2</p>
            <p className="text-orange-400 text-sm">All resisted</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/30"
          >
            <Heart size={32} className="text-violet-400 mb-4" />
            <p className="text-white/60 text-sm mb-1">Money Saved</p>
            <p className="text-4xl font-bold mb-2">$140</p>
            <p className="text-violet-400 text-sm">14 days smoke-free</p>
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
            <button className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-all text-center">
              <p className="font-semibold">I feel like smoking</p>
              <p className="text-sm text-white/60 mt-1">Get instant support</p>
            </button>
            <button className="px-6 py-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl transition-all text-center">
              <p className="font-semibold">I'm about to relapse</p>
              <p className="text-sm text-white/60 mt-1">Emergency help</p>
            </button>
            <button className="px-6 py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl transition-all text-center">
              <p className="font-semibold">I need motivation</p>
              <p className="text-sm text-white/60 mt-1">Stay strong</p>
            </button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
