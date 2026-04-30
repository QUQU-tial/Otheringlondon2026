import type { Activity } from "./storage";

/** Othering 2026 programme window (inclusive). */
export const PROGRAMME_START = new Date(2026, 7, 19); // 19 Aug
export const PROGRAMME_END = new Date(2026, 8, 19); // 19 Sep

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

/**
 * Assign each activity a calendar day inside the programme window, spread by
 * `createdAt` (earlier records earlier in the window) to avoid clustering.
 */
export function assignProgrammeWindowDates(activities: Activity[]): Activity[] {
  if (activities.length === 0) return activities;

  const sorted = [...activities].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const start = new Date(PROGRAMME_START);
  start.setHours(12, 0, 0, 0);
  const end = new Date(PROGRAMME_END);
  end.setHours(12, 0, 0, 0);
  const spanDays = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  );

  const idToDate = new Map<string, string>();
  const n = sorted.length;

  sorted.forEach((a, i) => {
    const slot = n <= 1 ? 0 : Math.round((i * spanDays) / (n - 1));
    idToDate.set(a.id, dayKey(addDays(start, slot)));
  });

  return activities.map((a) => {
    const next = idToDate.get(a.id);
    if (!next) return a;
    return { ...a, activity_date: next };
  });
}
