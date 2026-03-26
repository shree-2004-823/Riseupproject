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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-xl">R</span>
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