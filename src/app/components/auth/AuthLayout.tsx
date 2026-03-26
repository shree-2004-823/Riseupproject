import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  leftPanel: ReactNode;
}

export function AuthLayout({ children, leftPanel }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left Side - Emotional Visual Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-emerald-600 opacity-90"></div>
        
        {/* Animated moving gradient overlay */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.5) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.5) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        ></motion.div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          {leftPanel}
        </div>
      </motion.div>

      {/* Right Side - Form Panel */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_100%)]"></div>
        
        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
