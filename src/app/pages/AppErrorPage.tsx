import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router';

function getErrorDetails(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return {
      title: error.status === 404 ? 'Page not found' : 'Something went wrong',
      message:
        error.status === 404
          ? 'That page does not exist or the link is no longer valid.'
          : error.statusText || 'The app hit an unexpected route error.',
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Something went wrong',
      message: error.message || 'An unexpected error occurred while loading this page.',
      status: null,
    };
  }

  return {
    title: 'Something went wrong',
    message: 'An unexpected error occurred while loading this page.',
    status: null,
  };
}

export function AppErrorPage() {
  const error = useRouteError();
  const details = getErrorDetails(error);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
          <AlertTriangle size={28} />
        </div>
        <div className="space-y-3">
          {details.status ? (
            <p className="text-sm uppercase tracking-[0.24em] text-white/35">Error {details.status}</p>
          ) : null}
          <h1 className="text-3xl font-bold">{details.title}</h1>
          <p className="text-white/65 leading-relaxed">{details.message}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15"
          >
            <RefreshCw size={16} />
            Refresh page
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Home size={16} />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
