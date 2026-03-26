import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-zinc-950">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 left-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center"
          >
            <Sparkles size={28} className="text-blue-400" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -10, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-20 right-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-xl border border-violet-500/30 flex items-center justify-center"
          >
            <Sparkles size={32} className="text-violet-400" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 8, 0],
            }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute bottom-20 left-20 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center"
          >
            <Sparkles size={24} className="text-emerald-400" />
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-emerald-500/10 border border-white/20"
          >
            <Sparkles size={20} className="text-blue-400" />
            <span className="text-white font-medium">Join thousands transforming their lives</span>
          </motion.div>

          <h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
            Start improving today.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              One step at a time.
            </span>
          </h2>

          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Your journey to a better you begins now. Track habits, improve your mood, and get AI-powered coaching — all in one beautiful platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 text-white font-bold text-xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all"
            >
              <span className="flex items-center space-x-2">
                <span>Start Free</span>
                <ArrowRight
                  size={24}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 rounded-2xl border-2 border-white/20 text-white font-bold text-xl hover:bg-white/5 transition-all"
            >
              Learn More
            </motion.button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-white/50 text-sm"
          >
            No credit card required • Free forever • Cancel anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
