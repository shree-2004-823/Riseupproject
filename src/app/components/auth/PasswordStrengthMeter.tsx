import { motion } from 'motion/react';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const getStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: '' };

    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (pwd.length >= 12) score += 15;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 20;
    if (/\d/.test(pwd)) score += 20;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 20;

    if (score < 40) return { score, label: 'Weak', color: 'from-red-500 to-orange-500' };
    if (score < 70) return { score, label: 'Fair', color: 'from-orange-500 to-yellow-500' };
    if (score < 90) return { score, label: 'Good', color: 'from-yellow-500 to-green-500' };
    return { score, label: 'Strong', color: 'from-green-500 to-emerald-500' };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/60">Password Strength</span>
        <span className="text-xs font-semibold text-white/80">{strength.label}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strength.score}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full bg-gradient-to-r ${strength.color}`}
        ></motion.div>
      </div>
    </div>
  );
}
