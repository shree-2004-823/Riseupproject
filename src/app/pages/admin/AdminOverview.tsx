import { Users, Activity, TrendingUp, Zap } from "lucide-react";

const stats = [
  { label: "Total Users", value: "3,842", change: "+12%", icon: Users, color: "blue" },
  { label: "Active Today", value: "1,204", change: "+5%", icon: Activity, color: "emerald" },
  { label: "Weekly Growth", value: "8.3%", change: "+2.1%", icon: TrendingUp, color: "violet" },
  { label: "AI Sessions", value: "9,571", change: "+18%", icon: Zap, color: "amber" },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const recentActivity = [
  { user: "Sarah K.", action: "Completed 7-day streak", time: "2m ago" },
  { user: "James M.", action: "Started Quit Smoking plan", time: "14m ago" },
  { user: "Priya S.", action: "Logged mood check-in", time: "31m ago" },
  { user: "Tom A.", action: "Unlocked new challenge", time: "1h ago" },
  { user: "Lena R.", action: "Joined community forum", time: "2h ago" },
];

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-xl">Overview</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back, Admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="bg-[#1a1d27] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{label}</span>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${colorMap[color]}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-white text-2xl">{value}</div>
            <div className="text-emerald-400 text-xs mt-1">{change} this week</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1a1d27] border border-white/10 rounded-xl p-5">
        <h2 className="text-white text-sm mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map(({ user, action, time }) => (
            <div key={user + time} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs shrink-0">
                  {user[0]}
                </div>
                <div>
                  <span className="text-white text-sm">{user}</span>
                  <span className="text-gray-500 text-sm"> — {action}</span>
                </div>
              </div>
              <span className="text-gray-600 text-xs shrink-0 ml-4">{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
