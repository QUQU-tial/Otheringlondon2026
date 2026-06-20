import { parseActivityDate } from "./calendar";

export const ACTIVITY_AREAS = [
  "South London",
  "East London",
  "West London",
  "North London",
] as const;

export type ActivityArea = (typeof ACTIVITY_AREAS)[number];

export const SITE_LOGO_HEIGHT = "clamp(35px, 3.6vw, 46px)";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** First character upper, rest lower (e.g. "South London" → "South london"). */
export function sentenceCaseFirst(text: string): string {
  const t = text.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** `by` lowercase; author name with only the first letter capitalised. */
export function formatAuthorCredit(authorName: string): string {
  const trimmed = authorName.trim();
  if (!trimmed) return "by";
  const lower = trimmed.toLowerCase();
  return `by ${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

/** Compact meta date, e.g. `17–23 August, 2026`. */
export function formatActivityCompactDate(raw: string): string {
  if (!raw.trim()) return "";
  const dates = parseActivityDate(raw);
  if (dates.length === 0) return sentenceCaseFirst(raw);

  const fmt = (d: Date) =>
    `${d.getDate()} ${MONTH_NAMES[d.getMonth()] ?? ""}, ${d.getFullYear()}`;

  if (dates.length === 1) return fmt(dates[0]);

  const first = dates[0];
  const last = dates[dates.length - 1];
  if (
    first.getMonth() === last.getMonth() &&
    first.getFullYear() === last.getFullYear()
  ) {
    return `${first.getDate()}–${last.getDate()} ${MONTH_NAMES[first.getMonth()]}, ${first.getFullYear()}`;
  }
  return `${fmt(first)} – ${fmt(last)}`;
}

export function isActivityArea(value: string): value is ActivityArea {
  return (ACTIVITY_AREAS as readonly string[]).includes(value);
}

export function activityMatchesArea(
  activity: { activity_area?: string },
  filter: string
): boolean {
  if (!filter || filter === "All Areas") return true;
  return (activity.activity_area ?? "").trim() === filter;
}
