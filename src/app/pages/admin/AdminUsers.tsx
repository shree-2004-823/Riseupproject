import { useEffect, useState } from 'react';
import { CheckCircle, MoreHorizontal, Search, XCircle } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { AdminUserListItem, AdminUsersResponse } from '@/lib/types';

export function AdminUsers() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void apiFetch<AdminUsersResponse>('/admin/users')
      .then((response) => {
        setUsers(response.users);
      })
      .catch((requestError) => {
        if (requestError instanceof ApiError) {
          setError(requestError.message);
        } else {
          setError('Unable to load users.');
        }
      });
  }, []);

  const filtered = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.username?.toLowerCase().includes(search.toLowerCase()) ?? false),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} total users</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs bg-[#1a1d27] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-colors"
        />
      </div>

      <div className="bg-[#1a1d27] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-500 px-5 py-3">Name</th>
                <th className="text-left text-gray-500 px-5 py-3 hidden sm:table-cell">Role</th>
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
                        {user.fullName[0]}
                      </div>
                      <div>
                        <div className="text-white">{user.fullName}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                        {user.username ? <div className="text-gray-600 text-[11px]">@{user.username}</div> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      user.role === 'admin' || user.role === 'super_admin'
                        ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {user.onboardingCompleted ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-gray-500" />
                      )}
                      <span className={user.onboardingCompleted ? 'text-emerald-400' : 'text-gray-500'}>
                        {user.onboardingCompleted ? 'Onboarded' : 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      className="text-gray-600 hover:text-gray-300 transition-colors"
                      title={`Habits ${user.stats.habits}, mood logs ${user.stats.moodLogs}, cravings ${user.stats.cravingLogs}, plans ${user.stats.dailyPlans}`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!error && filtered.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-10">No users found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
