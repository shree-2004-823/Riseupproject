import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { Bell, Plus } from 'lucide-react';

export function RemindersPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reminders</h1>
            <p className="text-white/60">Stay on track with smart notifications</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 rounded-xl transition-all shadow-lg flex items-center space-x-2">
            <Plus size={20} />
            <span>Add Reminder</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 text-center"
        >
          <Bell size={48} className="text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Set Up Your Reminders</h3>
          <p className="text-white/60">Coming soon - Smart reminders for habits, mood check-ins, and more</p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
