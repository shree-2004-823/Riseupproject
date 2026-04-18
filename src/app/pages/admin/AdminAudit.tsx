import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { AdminAuditResponse } from '@/lib/types';

export function AdminAudit() {
  const [data, setData] = useState<AdminAuditResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void apiFetch<AdminAuditResponse>('/admin/audit')
      .then((response) => {
        setData(response);
      })
      .catch((requestError) => {
        if (requestError instanceof ApiError) {
          setError(requestError.message);
        } else {
          setError('Unable to load the admin audit trail.');
        }
      });
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white text-xl">Audit Trail</h1>
        <p className="text-gray-500 text-sm mt-0.5">Recent protected admin actions</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="bg-[#1a1d27] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-500 px-5 py-3">Action</th>
                <th className="text-left text-gray-500 px-5 py-3 hidden md:table-cell">Admin</th>
                <th className="text-left text-gray-500 px-5 py-3">Status</th>
                <th className="text-left text-gray-500 px-5 py-3 hidden lg:table-cell">Details</th>
                <th className="text-left text-gray-500 px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {(data?.logs ?? []).map((log) => (
                <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-blue-300" />
                      </div>
                      <div>
                        <div className="text-white">{log.action}</div>
                        <div className="text-gray-500 text-xs">{log.admin.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <div className="text-white">{log.admin.fullName}</div>
                    <div className="text-gray-500 text-xs">{log.admin.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        log.status.toLowerCase() === 'success'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                          : 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 hidden lg:table-cell">{log.details || '-'}</td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!error && data && data.logs.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-10">No audit entries yet.</div>
          ) : null}

          {!error && !data ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-14 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
