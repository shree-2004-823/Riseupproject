import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Bell,
  Zap,
  Award,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/lib/auth-context';

export function TopHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 h-16 bg-zinc-900/80 backdrop-blur-xl border-b border-white/10 z-30">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <p className="text-sm text-white/60">{currentDate}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Streak Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30"
          >
            <Award size={16} className="text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">
              7 Day Streak
            </span>
          </motion.div>

          {/* AI Status */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30"
          >
            <Zap size={16} className="text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">
              AI Active
            </span>
          </motion.div>

          {/* Search/Command Palette */}
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Search size={20} className="text-white/60" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Bell size={20} className="text-white/60" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    <NotificationItem
                      title="Daily reminder"
                      message="Don't forget to log your mood today"
                      time="2 hours ago"
                    />
                    <NotificationItem
                      title="Streak milestone!"
                      message="You've reached a 7-day streak 🎉"
                      time="1 day ago"
                    />
                    <NotificationItem
                      title="AI Insight"
                      message="Your mood improves after workouts"
                      time="2 days ago"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-1.5 pr-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                <span className="text-sm font-semibold">{initials}</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-white/60 transition-transform ${
                  showProfile ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="font-semibold">{user?.fullName ?? 'RiseUp User'}</p>
                    <p className="text-sm text-white/60">{user?.email ?? 'user@example.com'}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <User size={18} className="text-white/60" />
                      <span className="text-sm">Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Settings size={18} className="text-white/60" />
                      <span className="text-sm">Settings</span>
                    </Link>
                    <button
                      onClick={async () => {
                        await logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-red-400"
                    >
                      <LogOut size={18} />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
}

function NotificationItem({ title, message, time }: NotificationItemProps) {
  return (
    <div className="p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-sm text-white/60 mt-0.5">{message}</p>
      <p className="text-xs text-white/40 mt-1">{time}</p>
    </div>
  );
}
