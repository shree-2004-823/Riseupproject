import { motion } from 'motion/react';
import {
  CheckCircle2,
  Heart,
  MessageCircle,
  Target,
  Calendar,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    icon: CheckCircle2,
    title: 'Habit Tracking',
    description: 'Build positive routines with smart tracking, reminders, and streak management.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Heart,
    title: 'Mood & Emotional Check-ins',
    description: 'Track your emotional journey and discover patterns that affect your wellbeing.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: MessageCircle,
    title: 'AI Coach Chat',
    description: 'Get personalized advice, motivation, and support from your intelligent coach 24/7.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Target,
    title: 'Quit Bad Habits Support',
    description: 'Break free from smoking, drinking, or any habit with guided plans and AI assistance.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Calendar,
    title: 'Daily Planner',
    description: 'Organize your day with AI-optimized scheduling based on your energy patterns.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Visualize your growth with detailed insights, charts, and intelligent recommendations.',
    gradient: 'from-indigo-500 to-blue-500',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              transform your life
            </span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            A complete toolkit for building better habits, improving mental health, and achieving your goals
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Gradient Glow on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl`}></div>

              {/* Card */}
              <div className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-xl">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-2xl transition-shadow duration-300`}>
                  <feature.icon size={28} className="text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Indicator */}
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-full`}
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
