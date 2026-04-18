import { Compass, Home } from 'lucide-react';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
          <Compass size={28} />
        </div>
        <p className="text-sm uppercase tracking-[0.24em] text-white/35">404</p>
        <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-white/65 leading-relaxed">
          That route does not exist in RiseUp. Head back to the home page and keep moving from there.
        </p>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Home size={16} />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
