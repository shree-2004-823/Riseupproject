import { motion } from 'motion/react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold">Get Started</h3>
            <p className="text-white/60 text-sm">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <span className="text-blue-400 font-bold text-lg">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500"
          ></motion.div>
        </div>
      </div>
    </div>
  );
}
