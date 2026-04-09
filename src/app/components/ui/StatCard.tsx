import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  gradient: string;
  iconGradient: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  gradient,
  iconGradient,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`p-6 rounded-2xl ${gradient} border border-white/10 backdrop-blur-xl`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/60 text-sm mb-2">{label}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-white/40 text-xs">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${iconGradient} flex items-center justify-center shadow-lg`}
        >
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}
