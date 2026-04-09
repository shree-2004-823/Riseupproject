import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
  title: string;
  children: ReactNode;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  gradient?: string;
}

export function InsightCard({
  title,
  children,
  icon: Icon,
  action,
  gradient = 'bg-zinc-900/50',
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`p-6 rounded-2xl ${gradient} border border-white/10 backdrop-blur-xl`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <Icon size={20} className="text-white/80" />
            </div>
          )}
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
      <div>{children}</div>
    </motion.div>
  );
}
