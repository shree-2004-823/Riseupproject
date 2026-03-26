import { motion } from 'motion/react';
import { Target, Activity, MessageSquare, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Target,
    title: 'Set your goals',
    description: 'Define what you want to achieve and let AI create a personalized plan',
  },
  {
    icon: Activity,
    title: 'Track your day',
    description: 'Log habits, mood, and activities with simple check-ins',
  },
  {
    icon: MessageSquare,
    title: 'Talk to your AI coach',
    description: 'Get instant support, advice, and motivation whenever you need',
  },
  {
    icon: Sparkles,
    title: 'Improve with smart insights',
    description: 'Discover patterns and receive data-driven recommendations',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-32 bg-gradient-to-b from-zinc-950 to-zinc-900">
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
            How it{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              works
            </span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Four simple steps to start your transformation journey
          </p>
        </motion.div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Connecting Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 origin-left"
          ></motion.div>

          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="relative"
              >
                {/* Step Number */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.2 + 0.3 }}
                  className="relative z-10 w-16 h-16 mx-auto mb-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border-4 border-zinc-950 flex items-center justify-center shadow-xl"
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    {idx + 1}
                  </span>
                </motion.div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg"
                >
                  <step.icon size={32} className="text-blue-400" />
                </motion.div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="flex items-start space-x-6"
            >
              {/* Left: Number & Icon */}
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-white/10 flex items-center justify-center mb-4 shadow-xl">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    {idx + 1}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg">
                  <step.icon size={24} className="text-blue-400" />
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex-1 pt-2">
                <h3 className="text-xl font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
