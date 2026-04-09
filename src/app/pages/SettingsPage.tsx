import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { Settings, Bell, Lock, Palette, Globe, HelpCircle } from 'lucide-react';

export function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-white/60">Customize your experience</p>
        </div>

        <div className="space-y-4">
          {[
            { icon: Bell, title: 'Notifications', desc: 'Manage your notification preferences' },
            { icon: Lock, title: 'Privacy & Security', desc: 'Control your privacy settings' },
            { icon: Palette, title: 'Appearance', desc: 'Customize theme and display' },
            { icon: Globe, title: 'Language & Region', desc: 'Set your language preferences' },
            { icon: HelpCircle, title: 'Help & Support', desc: 'Get help and contact support' },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full flex items-center justify-between p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-white/20 transition-all text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon size={24} className="text-white/80" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-white/60 text-sm">{item.desc}</p>
                  </div>
                </div>
                <div className="text-white/40">→</div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-red-900/20 border border-red-500/30"
        >
          <h3 className="font-semibold text-red-400 mb-2">Danger Zone</h3>
          <p className="text-white/60 text-sm mb-4">Irreversible actions</p>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors text-red-400">
            Delete Account
          </button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
