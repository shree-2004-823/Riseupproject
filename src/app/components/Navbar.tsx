import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 shadow-2xl'
            : 'bg-transparent backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20 relative overflow-hidden">
                {/* glow ring */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-emerald-500/10" />
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 relative z-10">
                  <defs>
                    <linearGradient id="bodyGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#3b82f6"/>
                      <stop offset="50%" stopColor="#8b5cf6"/>
                      <stop offset="100%" stopColor="#10b981"/>
                    </linearGradient>
                  </defs>
                  {/* Head */}
                  <circle cx="18" cy="5.5" r="3" fill="url(#bodyGrad)"/>
                  {/* Neck */}
                  <rect x="16.5" y="8" width="3" height="2.5" rx="1" fill="url(#bodyGrad)"/>
                  {/* Shoulders / traps */}
                  <path d="M7 14 Q10 10 14 10.5 L16.5 10.5 L19.5 10.5 L22 10.5 Q26 10 29 14 L27 15 Q24 12 22 12 L19.5 12 L16.5 12 L14 12 Q12 12 9 15 Z" fill="url(#bodyGrad)"/>
                  {/* Left arm upper */}
                  <path d="M9 15 Q6 16 5 19 Q4.5 22 6 23.5 Q7 24.5 8.5 24 Q9.5 21 10 18 Z" fill="url(#bodyGrad)"/>
                  {/* Left forearm */}
                  <path d="M6 23.5 Q5 26 5.5 28 Q6 29.5 7.5 29 Q8.5 27.5 9 25.5 Q8 24.5 6 23.5 Z" fill="url(#bodyGrad)"/>
                  {/* Right arm upper */}
                  <path d="M27 15 Q30 16 31 19 Q31.5 22 30 23.5 Q29 24.5 27.5 24 Q26.5 21 26 18 Z" fill="url(#bodyGrad)"/>
                  {/* Right forearm */}
                  <path d="M30 23.5 Q31 26 30.5 28 Q30 29.5 28.5 29 Q27.5 27.5 27 25.5 Q28 24.5 30 23.5 Z" fill="url(#bodyGrad)"/>
                  {/* Chest / torso */}
                  <path d="M14 12 L14 20 Q14 22 18 22 Q22 22 22 20 L22 12 Z" fill="url(#bodyGrad)" opacity="0.9"/>
                  {/* Chest split */}
                  <line x1="18" y1="12" x2="18" y2="21" stroke="#0f0f1a" strokeWidth="0.8" opacity="0.6"/>
                  {/* Abs */}
                  <path d="M15.5 22 Q15 28 15.5 31 Q16.5 32 18 32 Q19.5 32 20.5 31 Q21 28 20.5 22 Z" fill="url(#bodyGrad)" opacity="0.85"/>
                  {/* Abs lines */}
                  <line x1="15.6" y1="25" x2="20.4" y2="25" stroke="#0f0f1a" strokeWidth="0.7" opacity="0.5"/>
                  <line x1="15.6" y1="28" x2="20.4" y2="28" stroke="#0f0f1a" strokeWidth="0.7" opacity="0.5"/>
                  <line x1="18" y1="22" x2="18" y2="32" stroke="#0f0f1a" strokeWidth="0.7" opacity="0.5"/>
                  {/* Left leg */}
                  <path d="M15.5 31 Q14 33 14.5 36 L17 36 L17.5 31 Z" fill="url(#bodyGrad)"/>
                  {/* Right leg */}
                  <path d="M20.5 31 Q22 33 21.5 36 L19 36 L18.5 31 Z" fill="url(#bodyGrad)"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                RiseUp AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a
                href="#home"
                className="text-white hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Home
              </a>
              <a
                href="#features"
                className="text-white/80 hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-white/80 hover:text-blue-400 transition-colors text-sm font-medium"
              >
                How It Works
              </a>
              <a
                href="#ai-coach"
                className="text-white/80 hover:text-blue-400 transition-colors text-sm font-medium"
              >
                AI Coach
              </a>
              <a
                href="#progress"
                className="text-white/80 hover:text-blue-400 transition-colors text-sm font-medium"
              >
                Progress
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/login">
                <button className="px-5 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all text-sm font-medium">
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 text-white hover:shadow-xl hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all text-sm font-bold">
                  Start Free
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-20 left-0 right-0 z-40 lg:hidden bg-zinc-950/98 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-4 py-6 space-y-4">
              <a
                href="#home"
                className="block text-white hover:text-blue-400 transition-colors py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#features"
                className="block text-white/80 hover:text-blue-400 transition-colors py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-white/80 hover:text-blue-400 transition-colors py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#ai-coach"
                className="block text-white/80 hover:text-blue-400 transition-colors py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Coach
              </a>
              <a
                href="#progress"
                className="block text-white/80 hover:text-blue-400 transition-colors py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Progress
              </a>
              <div className="pt-4 space-y-3">
                <Link to="/login" className="block">
                  <button className="w-full px-5 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all font-medium">
                    Login
                  </button>
                </Link>
                <Link to="/signup" className="block">
                  <button className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 text-white hover:shadow-xl transition-all font-bold">
                    Start Free
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}