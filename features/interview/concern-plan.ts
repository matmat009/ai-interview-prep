// Decides which questions in a session are weighted toward the candidate's
// stated concern. Chosen once up front (rather than rolled per request) so a
// session reliably gets 1-2 concern-focused questions — never 0, never 3+.
// Index 0 is the warm-up and is always excluded.
export function pickConcernIndices(total: number): number[] {
  const eligible = Array.from({ length: Math.max(0, total - 1) }, (_, i) => i + 1);
  if (eligible.length === 0) return [];

  const count = Math.min(Math.random() < 0.5 ? 1 : 2, eligible.length);
  const picked = new Set<number>();
  while (picked.size < count) {
    picked.add(eligible[Math.floor(Math.random() * eligible.length)]);
  }
  return [...picked].sort((a, b) => a - b);
}
