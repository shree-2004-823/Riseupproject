import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Save } from 'lucide-react';

export function JournalPage() {
  const [entry, setEntry] = useState('');

  const prompts = [
    'What did I do today?',
    'What went well?',
    'What was difficult?',
    'Did I avoid harmful habits?',
    'What should improve tomorrow?',
    'What am I proud of today?',
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Journal</h1>
          <p className="text-white/60">Reflect on your day</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
            >
              <h3 className="font-semibold mb-4">Today's Entry</h3>
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Start writing... How was your day?"
                className="w-full h-96 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
              <div className="flex items-center space-x-3 mt-4">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2">
                  <Save size={18} />
                  <span>Save Entry</span>
                </button>
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center space-x-2">
                  <Sparkles size={18} />
                  <span>AI Summary</span>
                </button>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
            >
              <h3 className="font-semibold mb-4">Guided Prompts</h3>
              <div className="space-y-2">
                {prompts.map((prompt, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border border-amber-500/30"
            >
              <BookOpen size={24} className="text-amber-400 mb-3" />
              <p className="text-white/60 text-sm mb-1">Journal Streak</p>
              <p className="text-3xl font-bold mb-2">14 days</p>
              <p className="text-amber-400 text-sm">Keep writing!</p>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
