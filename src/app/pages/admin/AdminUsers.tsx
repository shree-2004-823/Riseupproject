import { useState } from "react";
import { Search, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";

const allUsers = [
  { id: 1, name: "Sarah Kim", email: "sarah.kim@email.com", plan: "Pro", status: "Active", joined: "Jan 12, 2025" },
  { id: 2, name: "James Martin", email: "james.m@email.com", plan: "Free", status: "Active", joined: "Feb 3, 2025" },
  { id: 3, name: "Priya Shah", email: "priya.s@email.com", plan: "Pro", status: "Active", joined: "Feb 18, 2025" },
  { id: 4, name: "Tom Adams", email: "tom.a@email.com", plan: "Free", status: "Inactive", joined: "Mar 1, 2025" },
  { id: 5, name: "Lena Russo", email: "lena.r@email.com", plan: "Pro", status: "Active", joined: "Mar 9, 2025" },
  { id: 6, name: "Carlos Vega", email: "c.vega@email.com", plan: "Free", status: "Active", joined: "Mar 15, 2025" },
  { id: 7, name: "Mia Chen", email: "mia.chen@email.com", plan: "Pro", status: "Active", joined: "Mar 20, 2025" },
  { id: 8, name: "Noah Park", email: "noah.p@email.com", plan: "Free", status: "Inactive", joined: "Mar 25, 2025" },
];

export function AdminUsers() {
  const [search, setSearch] = useState("");

  const filtered = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{allUsers.length} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs bg-[#1a1d27] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1a1d27] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-500 px-5 py-3">Name</th>
                <th className="text-left text-gray-500 px-5 py-3 hidden sm:table-cell">Plan</th>
                <th className="text-left text-gray-500 px-5 py-3">Status</th>
                <th className="text-left text-gray-500 px-5 py-3 hidden md:table-cell">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="text-white">{user.name}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      user.plan === "Pro"
                        ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                        : "bg-white/5 text-gray-400 border-white/10"
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {user.status === "Active" ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-gray-500" />
                      )}
                      <span className={user.status === "Active" ? "text-emerald-400" : "text-gray-500"}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{user.joined}</td>
                  <td className="px-5 py-3">
                    <button className="text-gray-600 hover:text-gray-300 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-10">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
