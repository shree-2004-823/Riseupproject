import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Target,
  Heart,
  MessageCircle,
  Calendar,
  Ban,
  BookOpen,
  TrendingUp,
  Trophy,
  Bell,
  Users,
  User,
  Settings,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/habits', icon: Target, label: 'Habits' },
  { path: '/mood', icon: Heart, label: 'Mood' },
  { path: '/ai-coach', icon: MessageCircle, label: 'AI Coach' },
  { path: '/planner', icon: Calendar, label: 'Daily Planner' },
  { path: '/quit-support', icon: Ban, label: 'Quit Support' },
  { path: '/journal', icon: BookOpen, label: 'Journal' },
  { path: '/progress', icon: TrendingUp, label: 'Progress' },
  { path: '/challenges', icon: Trophy, label: 'Challenges' },
  { path: '/reminders', icon: Bell, label: 'Reminders' },
  { path: '/community', icon: Users, label: 'Community', badge: 'Soon' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-zinc-900/50 border-r border-white/10 backdrop-blur-xl transition-all duration-300 z-40 hidden lg:block ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo/Brand */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <span className="font-bold text-lg">AI Coach</span>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronLeft
                size={18}
                className={`transition-transform ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative block"
                >
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-violet-500 rounded-r-full"
                      />
                    )}

                    <Icon size={20} className="flex-shrink-0" />

                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-sm font-medium">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-violet-500/20 text-violet-400">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-900/95 backdrop-blur-xl border-t border-white/10 z-50 lg:hidden">
        <div className="h-full flex items-center justify-around px-2">
          {[
            { path: '/dashboard', icon: LayoutDashboard },
            { path: '/habits', icon: Target },
            { path: '/planner', icon: Calendar },
            { path: '/ai-coach', icon: MessageCircle },
            { path: '/profile', icon: User },
          ].map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors ${
                  isActive ? 'text-white' : 'text-white/60'
                }`}
              >
                <Icon size={22} />
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="w-1 h-1 mt-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
