"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  deleteSession,
  fetchSessions,
  hasUsedTodaysAction,
  toDisplaySession,
  type Session,
  type SessionStatus,
} from "@/features/history/sessions";
import {
  SessionActionsMenu,
  SessionCard,
  SessionStatusBadge,
  formatSessionDate,
  roleStyle,
} from "@/features/history/components/SessionCard";
import { DeleteSessionDialog } from "@/features/history/components/DeleteSessionDialog";

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
];

export function HistoryBrowser() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [role, setRole] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Gates whether "Continue" is offered on in-progress cards.
  const [usedToday, setUsedToday] = useState(false);
  // Delete confirmation (one dialog for the whole list).
  const [pendingDelete, setPendingDelete] = useState<Session | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load this user's sessions (newest first) + today's-action state.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (active) {
            setLoadError("Sign in to see your interview history.");
            setLoading(false);
          }
          return;
        }
        const [rows, used] = await Promise.all([
          fetchSessions(supabase, user.id),
          hasUsedTodaysAction(supabase, user.id),
        ]);
        if (!active) return;
        setAllSessions(rows.map(toDisplaySession));
        setUsedToday(used);
        setLoading(false);
      } catch (e) {
        if (!active) return;
        setLoadError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      await deleteSession(supabase, pendingDelete.id);
      setAllSessions((prev) => prev.filter((s) => s.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleting(false);
    }
  }

  const roleItems: Option[] = useMemo(
    () => [
      { label: "All Roles", value: "all" },
      ...Array.from(new Set(allSessions.map((s) => s.role))).map((r) => ({
        label: r,
        value: r,
      })),
    ],
    [allSessions],
  );

  const sessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = allSessions.filter((s) => {
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
  }, [allSessions, query, sort, status, role]);

  return (
    <div className="flex flex-col gap-5 px-4 py-4 md:px-6 md:py-6">
      {/* Actions — header bar already shows the "History" title */}
      <div className="flex items-center justify-end">
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
            items={roleItems}
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
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/40 py-16 text-center backdrop-blur">
          <p className="text-sm text-muted-foreground">Loading sessions…</p>
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/40 py-16 text-center backdrop-blur">
          <p className="font-medium">Couldn&apos;t load your history</p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/40 py-16 text-center backdrop-blur">
          <p className="font-medium">
            {allSessions.length === 0 ? "No sessions yet" : "No sessions found"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {allSessions.length === 0
              ? "Start an interview and it'll show up here."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              usedToday={usedToday}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      ) : (
        <SessionList
          sessions={sessions}
          usedToday={usedToday}
          onDelete={setPendingDelete}
        />
      )}

      <DeleteSessionDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
        label={pendingDelete?.role}
        deleting={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
      />
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

function SessionList({
  sessions,
  usedToday,
  onDelete,
}: {
  sessions: Session[];
  usedToday: boolean;
  onDelete: (session: Session) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-card/60 backdrop-blur-xl">
      {sessions.map((s) => {
        const { icon: Icon, gradient } = roleStyle(s.role);
        const completed = s.status === "Completed";
        return (
          <div
            key={s.id}
            className="relative flex items-center gap-4 border-b border-white/5 px-4 py-3 transition-colors last:border-0 hover:bg-white/5"
          >
            {/* Row navigation under the actions menu (z-10 below). */}
            <Link
              href={`/history/${s.id}`}
              aria-label={`View ${s.role} session`}
              className="absolute inset-0 z-[1]"
            />
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
            <div className="relative z-10">
              <SessionActionsMenu
                session={s}
                usedToday={usedToday}
                onDelete={onDelete}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
