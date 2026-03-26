import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Brain, Cigarette, Target } from 'lucide-react';

const scenarios = [
  {
    id: 'fitness',
    icon: Dumbbell,
    title: 'Get fit',
    color: 'from-blue-500 to-cyan-500',
    aiSuggestion: "Based on your schedule, I recommend morning workouts. You're 80% more likely to complete them.",
    habits: ['30-min morning run', 'Strength training 3x/week', 'Track protein intake', '8 hours sleep'],
  },
  {
    id: 'mental',
    icon: Brain,
    title: 'Feel mentally better',
    color: 'from-violet-500 to-purple-500',
    aiSuggestion: "Evening meditation works best for you. Let's start with 5 minutes and build from there.",
    habits: ['Daily meditation', 'Gratitude journaling', 'Limit social media', 'Talk to friends weekly'],
  },
  {
    id: 'quit',
    icon: Cigarette,
    title: 'Quit smoking',
    color: 'from-orange-500 to-red-500',
    aiSuggestion: "Your cravings peak at 3 PM. I'll send you a motivational message 10 minutes before.",
    habits: ['Track cravings', 'Replace with water', 'Avoid triggers', 'Celebrate milestones'],
  },
  {
    id: 'discipline',
    icon: Target,
    title: 'Build discipline',
    color: 'from-emerald-500 to-teal-500',
    aiSuggestion: 'Start with 3 core habits. Consistency matters more than quantity.',
    habits: ['Wake up at 6 AM', 'Make your bed', 'Cold shower', 'No phone for 1 hour'],
  },
];

export function ScenarioSection() {
  const [activeScenario, setActiveScenario] = useState(scenarios[0]);

  return (
    <section className="relative py-32 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Choose your{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              path
            </span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Get personalized plans and AI guidance for your specific goals
          </p>
        </motion.div>

        {/* Scenario Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {scenarios.map((scenario, idx) => (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveScenario(scenario)}
              className={`relative px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                activeScenario.id === scenario.id
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              {activeScenario.id === scenario.id && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 bg-gradient-to-r ${scenario.color} rounded-2xl`}
                  transition={{ type: 'spring', duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center space-x-2">
                <scenario.icon size={20} />
                <span>{scenario.title}</span>
              </span>
            </motion.button>
          ))}
        </div>

        {/* Scenario Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScenario.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {/* Left: UI Preview */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${activeScenario.color} flex items-center justify-center shadow-lg`}>
                  <activeScenario.icon size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{activeScenario.title}</h3>
                  <p className="text-white/60 text-sm">Personalized plan</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white/80 text-sm">Current Streak</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    7 days 🔥
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-sm">Weekly Progress</span>
                    <span className="text-emerald-400 font-bold">78%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '78%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${activeScenario.color}`}
                    ></motion.div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 font-semibold text-sm mb-1">Achievement Unlocked!</p>
                  <p className="text-white/70 text-sm">One week streak completed 🎉</p>
                </div>
              </div>
            </div>

            {/* Right: AI Suggestion & Habits */}
            <div className="space-y-6">
              {/* AI Suggestion */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 backdrop-blur-xl border border-violet-500/20 shadow-2xl"
              >
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Brain size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">AI Coach Says:</h4>
                    <p className="text-white/80 leading-relaxed">{activeScenario.aiSuggestion}</p>
                  </div>
                </div>
              </motion.div>

              {/* Habit Suggestions */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-xl border border-white/10 shadow-2xl">
                <h4 className="text-white font-bold mb-4 text-lg">Recommended Habits</h4>
                <div className="space-y-3">
                  {activeScenario.habits.map((habit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${activeScenario.color} flex items-center justify-center flex-shrink-0`}>
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
                      <span className="text-white/90">{habit}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full mt-6 px-6 py-4 rounded-xl bg-gradient-to-r ${activeScenario.color} text-white font-bold shadow-lg hover:shadow-xl transition-shadow`}
                >
                  Start This Plan
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}