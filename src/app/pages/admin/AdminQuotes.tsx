import { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type { AdminQuotesResponse } from '@/lib/types';

export function AdminQuotes() {
  const [data, setData] = useState<AdminQuotesResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void apiFetch<AdminQuotesResponse>('/admin/quotes')
      .then((response) => {
        setData(response);
      })
      .catch((requestError) => {
        if (requestError instanceof ApiError) {
          setError(requestError.message);
        } else {
          setError('Unable to load quotes.');
        }
      });
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white text-xl">Quotes</h1>
        <p className="text-gray-500 text-sm mt-0.5">Live motivational quote inventory</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(data?.quotes ?? []).map((quote) => (
          <div key={quote.id} className="rounded-xl border border-white/10 bg-[#1a1d27] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Quote className="w-4 h-4 text-violet-300" />
                </div>
                <div>
                  <p className="text-white leading-relaxed">{quote.content}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-gray-400 uppercase tracking-[0.2em]">
                      {quote.category}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-1 ${
                        quote.isActive
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                          : 'border-white/10 bg-white/5 text-gray-400'
                      }`}
                    >
                      {quote.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-gray-500">Order {quote.sortOrder}</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500 shrink-0">
                <div>{quote.author ?? 'Unknown'}</div>
                <div className="mt-1">{new Date(quote.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!error && data && data.quotes.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#1a1d27] px-4 py-8 text-center text-sm text-gray-500">
          No quotes available yet.
        </div>
      ) : null}

      {!error && !data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-[172px] rounded-xl bg-[#1a1d27] border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
