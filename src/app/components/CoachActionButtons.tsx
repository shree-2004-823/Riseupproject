import { Bell, CalendarPlus, CheckCircle2, Loader2 } from 'lucide-react';
import type { AIAgentAction } from '@/lib/types';

function getActionIcon(kind: AIAgentAction['kind']) {
  if (kind === 'create_planner_task') {
    return CalendarPlus;
  }

  if (kind === 'upsert_reminder') {
    return Bell;
  }

  return CheckCircle2;
}

export function CoachActionButtons(props: {
  actions: AIAgentAction[];
  busyActionId?: string | null;
  onRun: (actionId: string) => void;
}) {
  if (props.actions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Coach actions</p>
      <div className="grid gap-2">
        {props.actions.map((action) => {
          const Icon = getActionIcon(action.kind);
          const busy = props.busyActionId === action.id;

          return (
            <button
              key={action.id}
              onClick={() => props.onRun(action.id)}
              disabled={busy}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left transition-colors hover:bg-white/10 disabled:opacity-60"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{action.label}</div>
                  <div className="mt-1 text-xs leading-relaxed text-white/55">{action.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
