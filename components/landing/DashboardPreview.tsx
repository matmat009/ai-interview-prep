import { ChevronDown, Monitor, Search, Smartphone, Tablet } from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="relative mt-16 flex-1 px-4 sm:px-10">
      {/* Purple glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.55),transparent)] blur-2xl"
      />

      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-t-xl border border-white/10 bg-[#0d0d0f] shadow-[0_-20px_80px_-20px_rgba(124,58,237,0.35)]">
        {/* App top bar */}
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5">
              <div className="size-4 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500" />
              <span className="text-xs font-medium text-white/80">
                Maya Chen
              </span>
              <ChevronDown className="size-3 text-white/40" />
            </div>
            <nav className="hidden items-center gap-4 text-xs text-white/50 lg:flex">
              <span className="text-white">Overview</span>
              <span>Sessions</span>
              <span>Question Bank</span>
              <span>Settings</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/40 sm:flex">
              <Search className="size-3" />
              <span>Search…</span>
            </div>
            <div className="size-6 rounded-full bg-white/10" />
          </div>
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between gap-4 px-5 pt-5">
          <h2 className="text-lg font-semibold text-white">Dashboard</h2>
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/60">
              Jan 20, 2026 – Feb 09, 2026
            </div>
            <div className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black">
              Export
            </div>
          </div>
        </div>

        {/* Sub tabs + preview controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
          <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-1 text-xs">
            <span className="rounded-md bg-white/10 px-2.5 py-1 text-white">
              Overview
            </span>
            <span className="px-2.5 py-1 text-white/50">Analytics</span>
            <span className="px-2.5 py-1 text-white/50">Feedback</span>
            <span className="px-2.5 py-1 text-white/50">Reminders</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-orange-400" />
              <span className="size-2.5 rounded-full bg-red-400" />
              <span className="size-2.5 rounded-full bg-violet-500" />
              <span className="size-2.5 rounded-full bg-white/30" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Monitor className="size-4" />
              <Smartphone className="size-4" />
              <Tablet className="size-4" />
            </div>
            <div className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/70">
              Live preview
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 px-5 py-5 lg:grid-cols-4">
          <StatCard label="Interviews completed" value="128" delta="+12%" />
          <StatCard label="Average score" value="86%" delta="+4.2%" />
          <StatCard label="Questions practiced" value="1,204" delta="+318" />
          <StatCard label="Streak" value="9 days" delta="Personal best" />
        </div>

        {/* Chart placeholder */}
        <div className="px-5 pb-8">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-white/80">
                Readiness over time
              </span>
              <span className="text-xs text-white/40">Last 30 days</span>
            </div>
            <div className="flex h-28 items-end gap-1.5">
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 rounded-t bg-gradient-to-t from-violet-500/30 to-violet-400/80"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-emerald-400/80">{delta}</div>
    </div>
  );
}

const BAR_HEIGHTS = [
  35, 42, 38, 55, 48, 62, 58, 70, 65, 78, 72, 85, 80, 92, 88, 74, 82, 90, 95,
  84,
];
