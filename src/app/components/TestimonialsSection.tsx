import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Quit smoking after 10 years',
    image: 'https://images.unsplash.com/photo-1765490526034-65d6fa69ab13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwd2VsbG5lc3MlMjBjYWxtJTIwbWluZGZ1bG5lc3N8ZW58MXx8fHwxNzc0NTUyNDkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    text: "The AI coach helped me identify my triggers and stay accountable. I'm 3 months smoke-free and feeling incredible!",
    days: 90,
  },
  {
    name: 'Marcus Johnson',
    role: 'Built consistent workout routine',
    image: 'https://images.unsplash.com/photo-1589451431369-f569890dfd84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwc3RyZW5ndGglMjB3b3Jrb3V0JTIwbW90aXZhdGlvbnxlbnwxfHx8fDE3NzQ1NTI0OTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    text: 'Finally found an app that understands me. The insights about my morning energy were spot on. Down 15 lbs!',
    days: 60,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Improved mental health',
    image: 'https://images.unsplash.com/photo-1698757264929-409ff213e807?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMG5hdHVyZSUyMG1lbnRhbCUyMGhlYWx0aHxlbnwxfHx8fDE3NzQ0OTk5MTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    text: 'Tracking my mood helped me realize patterns I never noticed. The AI provides such personalized, caring support.',
    days: 45,
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-32 bg-gradient-to-b from-zinc-950 to-zinc-900">
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
            Real people,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              real transformations
            </span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Join thousands who've transformed their lives with RiseUp AI
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -8 }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-white/20 transition-all"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote size={64} className="text-white" />
              </div>

              {/* Rating */}
              <div className="flex space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-white/90 leading-relaxed mb-6 relative z-10">
                "{testimonial.text}"
              </p>

              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/10">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">{testimonial.name}</h4>
                  <p className="text-white/60 text-sm">{testimonial.role}</p>
                </div>
              </div>

              {/* Days Badge */}
              <div className="absolute bottom-8 right-8 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                <span className="text-emerald-400 font-bold text-sm">
                  {testimonial.days} days streak
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
        >
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '2M+', label: 'Habits Tracked' },
            { value: '95%', label: 'Success Rate' },
            { value: '4.9', label: 'Avg Rating' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + idx * 0.1 }}
                className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent mb-2"
              >
                {stat.value}
              </motion.div>
              <div className="text-white/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
