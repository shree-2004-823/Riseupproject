import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`w-full px-6 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
        isPrimary
          ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:shadow-blue-500/50 hover:shadow-2xl'
          : 'bg-white/10 border border-white/20 hover:bg-white/20'
      } ${
        disabled || loading
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-xl'
      } relative overflow-hidden`}
    >
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </motion.button>
  );
}
