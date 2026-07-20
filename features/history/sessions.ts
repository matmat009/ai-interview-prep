// Dummy session data for the History page. Shape mirrors what's used elsewhere
// (role, date, score, status). Replaced with real persisted sessions later.

export type SessionStatus = "Completed" | "In Progress" | "Scheduled";

export type Session = {
  id: string;
  role: string;
  focus: string;
  date: string; // ISO (YYYY-MM-DD)
  score: number | null; // null unless Completed
  status: SessionStatus;
};

export const SESSIONS: Session[] = [
  { id: "s-frontend-01", role: "Frontend Engineer", focus: "System Design", date: "2026-07-19", score: 88, status: "Completed" },
  { id: "s-backend-01", role: "Backend Engineer", focus: "Behavioral", date: "2026-07-17", score: 76, status: "Completed" },
  { id: "s-pm-01", role: "Product Manager", focus: "Case Study", date: "2026-07-16", score: null, status: "In Progress" },
  { id: "s-data-01", role: "Data Scientist", focus: "Technical", date: "2026-07-12", score: 91, status: "Completed" },
  { id: "s-devops-01", role: "DevOps Engineer", focus: "System Design", date: "2026-07-23", score: null, status: "Scheduled" },
  { id: "s-fullstack-01", role: "Full Stack Engineer", focus: "System Design", date: "2026-07-08", score: 82, status: "Completed" },
  { id: "s-em-01", role: "Engineering Manager", focus: "Behavioral", date: "2026-07-05", score: 79, status: "Completed" },
  { id: "s-mobile-01", role: "Mobile Engineer", focus: "Technical", date: "2026-07-25", score: null, status: "Scheduled" },
  { id: "s-ml-01", role: "Machine Learning Engineer", focus: "Technical", date: "2026-06-30", score: 85, status: "Completed" },
];

export const ROLES: string[] = Array.from(new Set(SESSIONS.map((s) => s.role)));

export function getSessionById(id: string): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}
