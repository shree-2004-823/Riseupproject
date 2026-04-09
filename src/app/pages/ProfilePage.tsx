import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Award, Target, TrendingUp } from 'lucide-react';

export function ProfilePage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-white/60">Your journey at a glance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-4xl font-bold mb-4">
                S
              </div>
              <h2 className="text-2xl font-bold mb-1">Shree Kumar</h2>
              <p className="text-white/60 text-sm mb-4">shree@example.com</p>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-orange-500/20 rounded-full mb-4">
                <Award size={16} className="text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">7 Day Streak</span>
              </div>
              <button className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                Edit Profile
              </button>
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
                    <p className="font-medium">Shree Kumar</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <Mail size={20} className="text-white/60" />
                  <div>
                    <p className="text-xs text-white/60">Email</p>
                    <p className="font-medium">shree@example.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <Calendar size={20} className="text-white/60" />
                  <div>
                    <p className="text-xs text-white/60">Member Since</p>
                    <p className="font-medium">March 2026</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 to-violet-900/20 border border-blue-500/30">
              <h3 className="font-semibold text-lg mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <Target size={20} className="text-blue-400 mb-2" />
                  <p className="text-white/60 text-xs mb-1">Total Habits</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <Award size={20} className="text-orange-400 mb-2" />
                  <p className="text-white/60 text-xs mb-1">Longest Streak</p>
                  <p className="text-2xl font-bold">14 days</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <TrendingUp size={20} className="text-emerald-400 mb-2" />
                  <p className="text-white/60 text-xs mb-1">This Week</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <Calendar size={20} className="text-violet-400 mb-2" />
                  <p className="text-white/60 text-xs mb-1">Check-Ins</p>
                  <p className="text-2xl font-bold">7 days</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
