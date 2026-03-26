import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles } from 'lucide-react';

const messages = [
  { type: 'ai', text: 'How are you feeling today?' },
  { type: 'ai', text: "You missed your run. Want a 10-minute backup plan?" },
  { type: 'ai', text: 'You resisted smoking yesterday. Great work! 🎉' },
];

const promptChips = [
  'Motivate me 💪',
  'I feel low 😔',
  'Help me quit smoking 🚭',
  'Track my progress 📊',
];

export function AICoachSection() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const showMessage = (idx: number) => {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages((prev) => [...prev, idx]);
        }, 1000);
      }, idx * 2500);
    };

    messages.forEach((_, idx) => showMessage(idx));
  }, []);

  return (
    <section id="ai-coach" className="relative py-32 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm">
              <Sparkles size={16} />
              <span>Powered by Advanced AI</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              Your personal{' '}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI coach
              </span>
              {' '}is always here
            </h2>

            <p className="text-xl text-white/70 leading-relaxed">
              Get personalized guidance, instant motivation, and intelligent support whenever you need it.
              Your AI coach understands your journey and adapts to your needs.
            </p>

            <div className="space-y-4 pt-4">
              {[
                '24/7 availability for instant support',
                'Personalized advice based on your progress',
                'Motivational messages when you need them',
                'Smart suggestions for overcoming challenges',
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-white/80">{feature}</span>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-2xl shadow-violet-500/50 hover:shadow-violet-500/70 transition-shadow"
            >
              Try AI Coach Now
            </motion.button>
          </motion.div>

          {/* Right: Chat Interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Chat Card */}
            <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">AI Coach</h3>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-white/60">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4 mb-6 min-h-[300px]">
                <AnimatePresence>
                  {visibleMessages.map((msgIdx) => (
                    <motion.div
                      key={msgIdx}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={14} className="text-white" />
                      </div>
                      <div className="flex-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10">
                        <p className="text-white/90 text-sm leading-relaxed">
                          {messages[msgIdx].text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={14} className="text-white" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10">
                        <div className="flex space-x-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-white/60 rounded-full"
                          ></motion.div>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-white/60 rounded-full"
                          ></motion.div>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-white/60 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Suggested Prompts */}
              <div className="flex flex-wrap gap-2 mb-4">
                {promptChips.map((chip, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-all"
                  >
                    {chip}
                  </motion.button>
                ))}
              </div>

              {/* Input Field */}
              <div className="flex items-center space-x-3">
                <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm">
                  Type your message...
                </div>
                <button className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <Send size={18} className="text-white" />
                </button>
              </div>

              {/* Glow Effect */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
