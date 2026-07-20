import type { ComponentType } from "react";

import Link from "next/link";
import {
  BrainCircuit,
  Briefcase,
  ClipboardList,
  Code2,
  Database,
  Layers,
  Server,
  Settings,
  Smartphone,
  Users,
} from "lucide-react";

import type { Session, SessionStatus } from "@/features/history/sessions";

type IconType = ComponentType<{ className?: string; strokeWidth?: number }>;
type RoleStyle = { icon: IconType; gradient: string };

// Deterministic color + icon per role (stands in for a real screenshot preview).
// Gradients stay in the app's violet/blue/fuchsia family for cohesion.
const ROLE_STYLES: Record<string, RoleStyle> = {
  "Frontend Engineer": { icon: Code2, gradient: "from-violet-500 to-fuchsia-600" },
  "Backend Engineer": { icon: Server, gradient: "from-blue-500 to-indigo-600" },
  "Full Stack Engineer": { icon: Layers, gradient: "from-purple-500 to-blue-600" },
  "Product Manager": { icon: ClipboardList, gradient: "from-fuchsia-500 to-pink-600" },
  "Data Scientist": { icon: Database, gradient: "from-indigo-500 to-violet-600" },
  "DevOps Engineer": { icon: Settings, gradient: "from-sky-500 to-blue-600" },
  "Engineering Manager": { icon: Users, gradient: "from-violet-600 to-purple-700" },
  "Mobile Engineer": { icon: Smartphone, gradient: "from-cyan-500 to-blue-600" },
  "Machine Learning Engineer": { icon: BrainCircuit, gradient: "from-purple-500 to-fuchsia-600" },
};

const DEFAULT_STYLE: RoleStyle = {
  icon: Briefcase,
  gradient: "from-violet-500 to-fuchsia-600",
};

export function roleStyle(role: string): RoleStyle {
  return ROLE_STYLES[role] ?? DEFAULT_STYLE;
}

export function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_DOT: Record<SessionStatus, string> = {
  Completed: "bg-emerald-400",
  "In Progress": "bg-amber-400",
  Scheduled: "bg-sky-400",
};

// Legible on both a bright gradient overlay and a dark list row.
export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
      <span className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

export function SessionCard({ session }: { session: Session }) {
  const { icon: Icon, gradient } = roleStyle(session.role);
  const completed = session.status === "Completed";

  return (
    <Link
      href={`/history/${session.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-card/60 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/20 hover:shadow-xl"
    >
      {/* Accent preview */}
      <div
        className={`relative aspect-video overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        <Icon className="absolute -right-5 -bottom-6 size-32 text-white/15 transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="size-9 text-white/90" strokeWidth={1.5} />
        </div>
        <div className="absolute top-3 left-3">
          <SessionStatusBadge status={session.status} />
        </div>
        {completed && (
          <div className="absolute top-3 right-3 inline-flex items-center rounded-full border border-white/10 bg-background/80 px-2 py-0.5 text-xs font-semibold text-foreground backdrop-blur-sm tabular-nums">
            {session.score}%
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 p-4">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white`}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{session.role}</p>
          <p className="truncate text-sm text-muted-foreground">
            {formatSessionDate(session.date)}
            {completed ? ` · ${session.score}%` : ` · ${session.focus}`}
          </p>
        </div>
      </div>
    </Link>
  );
}
