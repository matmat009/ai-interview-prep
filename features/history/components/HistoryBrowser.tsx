"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import Link from "next/link";
import { LayoutGrid, List, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ROLES,
  SESSIONS,
  type Session,
  type SessionStatus,
} from "@/features/history/sessions";
import {
  SessionCard,
  SessionStatusBadge,
  formatSessionDate,
  roleStyle,
} from "@/features/history/components/SessionCard";

type SortKey = "recent" | "oldest" | "score";
type StatusFilter = "all" | SessionStatus;
type Option = { label: string; value: string };

const SORT_ITEMS: Option[] = [
  { label: "Most Recent", value: "recent" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest Score", value: "score" },
];

const STATUS_ITEMS: Option[] = [
  { label: "Any status", value: "all" },
  { label: "Completed", value: "Completed" },
  { label: "In Progress", value: "In Progress" },
  { label: "Scheduled", value: "Scheduled" },
];

const ROLE_ITEMS: Option[] = [
  { label: "All Roles", value: "all" },
  ...ROLES.map((r) => ({ label: r, value: r })),
];

export function HistoryBrowser() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [role, setRole] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const sessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = SESSIONS.filter((s) => {
      if (q && !s.role.toLowerCase().includes(q)) return false;
      if (status !== "all" && s.status !== status) return false;
      if (role !== "all" && s.role !== role) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === "score") return (b.score ?? -1) - (a.score ?? -1);
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sort === "recent" ? db - da : da - db;
    });
  }, [query, sort, status, role]);

  return (
    <div className="flex flex-col gap-5 px-4 py-4 md:px-6 md:py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <Button
          nativeButton={false}
          render={<Link href="/interview" />}
          className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
        >
          <Plus />
          New Session
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions by role..."
            className="bg-card/60 pl-9 backdrop-blur"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            items={SORT_ITEMS}
            width="w-[150px]"
          />
          <FilterSelect
            value={status}
            onChange={(v) => setStatus(v as StatusFilter)}
            items={STATUS_ITEMS}
            width="w-[150px]"
          />
          <FilterSelect
            value={role}
            onChange={setRole}
            items={ROLE_ITEMS}
            width="w-[180px]"
          />
          <div className="flex items-center rounded-md border border-input bg-card/60 p-0.5 backdrop-blur">
            <ViewButton
              active={view === "grid"}
              onClick={() => setView("grid")}
              label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </ViewButton>
            <ViewButton
              active={view === "list"}
              onClick={() => setView("list")}
              label="List view"
            >
              <List className="size-4" />
            </ViewButton>
          </div>
        </div>
      </div>

      {/* Section label */}
      <p className="text-sm font-medium text-muted-foreground">
        {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
      </p>

      {/* Content */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/40 py-16 text-center backdrop-blur">
          <p className="font-medium">No sessions found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      ) : (
        <SessionList sessions={sessions} />
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  items,
  width,
}: {
  value: string;
  onChange: (value: string) => void;
  items: Option[];
  width: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(String(v))}
      items={items}
    >
      <SelectTrigger className={`${width} bg-card/60 backdrop-blur`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex size-7 items-center justify-center rounded transition-colors ${
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function SessionList({ sessions }: { sessions: Session[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-card/60 backdrop-blur-xl">
      {sessions.map((s) => {
        const { icon: Icon, gradient } = roleStyle(s.role);
        const completed = s.status === "Completed";
        return (
          <Link
            key={s.id}
            href={`/history/${s.id}`}
            className="flex items-center gap-4 border-b border-white/5 px-4 py-3 transition-colors last:border-0 hover:bg-white/5"
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white`}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{s.role}</p>
              <p className="truncate text-xs text-muted-foreground">
                {s.focus}
              </p>
            </div>
            <span className="hidden text-sm text-muted-foreground tabular-nums sm:block">
              {formatSessionDate(s.date)}
            </span>
            <span className="w-12 text-right text-sm font-medium tabular-nums">
              {completed ? `${s.score}%` : "—"}
            </span>
            <SessionStatusBadge status={s.status} />
          </Link>
        );
      })}
    </div>
  );
}
