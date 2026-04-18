import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { AuthResponse } from '@/lib/types';

export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiFetch<AuthResponse>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ accessKey }),
      });

      const user = await refresh();

      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        setError('Admin access is required for this area.');
        return;
      }

      const nextPath =
        typeof location.state === 'object' &&
        location.state !== null &&
        'from' in location.state &&
        typeof location.state.from === 'object' &&
        location.state.from !== null &&
        'pathname' in location.state.from &&
        typeof location.state.from.pathname === 'string'
          ? location.state.from.pathname
          : '/admin';

      navigate(nextPath, { replace: true });
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to verify the admin key right now.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-white text-xl">RiseUp Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Enter the admin access key to continue</p>
        </div>

        <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            ) : null}

            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Admin Access Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={accessKey}
                  onChange={(event) => setAccessKey(event.target.value)}
                  placeholder="Enter secret key"
                  required
                  className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-lg py-2.5 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Verifying...' : 'Enter Admin Panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">Restricted access by secret key only</p>
      </div>
    </div>
  );
}
