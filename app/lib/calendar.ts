/**
 * Calendar export utilities
 * Generates .ics files for calendar events
 */

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
}

/**
 * Generate an .ics file content string
 */
export function generateICS(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const startDateStr = formatDate(event.startDate);
  const endDateStr = event.endDate ? formatDate(event.endDate) : startDateStr;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OT FESTIVAL//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@ot-festival`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${startDateStr}`,
    `DTEND:${endDateStr}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Download an .ics file
 */
export function downloadICS(event: CalendarEvent, filename: string = 'event.ics'): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse activity date string into Date objects
 * Supports formats like:
 * - "20th sept. 2026"
 * - "20th sept. 2026, 6pm"
 * - Multiple dates separated by commas or semicolons
 */
export function parseActivityDate(dateString: string): Date[] {
  if (!dateString || !dateString.trim()) {
    return [];
  }

  const monthMap: { [key: string]: number } = {
    'jan': 0, 'january': 0,
    'feb': 1, 'february': 1,
    'mar': 2, 'march': 2,
    'apr': 3, 'april': 3,
    'may': 4,
    'jun': 5, 'june': 5,
    'jul': 6, 'july': 6,
    'aug': 7, 'august': 7,
    'sep': 8, 'sept': 8, 'september': 8,
    'oct': 9, 'october': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
  };

  const dates: Date[] = [];
  
  // Split by common separators (comma, semicolon, or "and")
  const dateParts = dateString
    .split(/[,;]|\sand\s/i)
    .map(s => s.trim())
    .filter(s => s);
  
  for (const part of dateParts) {
    try {
      // Support ISO-like dates: 2026-08-15 or 2026-08-15T...
      const isoMatch = part.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10) - 1;
        const day = parseInt(isoMatch[3], 10);
        const isoDate = new Date(year, month, day, 18, 0, 0);
        if (!isNaN(isoDate.getTime())) {
          dates.push(isoDate);
          continue;
        }
      }

      // Match patterns like "20th sept. 2026" or "20 sept 2026" or "20th sept 2026, 6pm"
      const match = part.match(/(\d+)(?:st|nd|rd|th)?\s+([a-z]+)\.?\s+(\d{4})(?:\s*,\s*(\d+)(?:am|pm))?/i);
      
      if (match) {
        const day = parseInt(match[1], 10);
        const monthName = match[2].toLowerCase();
        const year = parseInt(match[3], 10);
        
        // Parse time if present
        let hour = 18; // Default to 6pm
        let minute = 0;
        if (match[4]) {
          const timeStr = match[4].toLowerCase();
          const hourMatch = timeStr.match(/(\d+)(am|pm)?/);
          if (hourMatch) {
            hour = parseInt(hourMatch[1], 10);
            const period = hourMatch[2];
            if (period === 'pm' && hour !== 12) {
              hour += 12;
            } else if (period === 'am' && hour === 12) {
              hour = 0;
            }
          }
        }
        
        const month = monthMap[monthName];
        if (month !== undefined) {
          const date = new Date(year, month, day, hour, minute, 0);
          if (!isNaN(date.getTime())) {
            dates.push(date);
          }
        }
      }
    } catch (e) {
      // Skip invalid dates
      console.warn('Failed to parse date:', part, e);
    }
  }

  // If no dates parsed, try to create a fallback date
  if (dates.length === 0) {
    // Try to extract year and create a default date
    const yearMatch = dateString.match(/(\d{4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);
      dates.push(new Date(year, 8, 20, 18, 0, 0)); // Default: Sept 20, 6pm
    }
  }

  return dates;
}

/** Abbreviated month names (Sept = British preference, not "Sep") */
const UK_MONTHS_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** British-style display: `Wednesday, 3 Sept 2026` (`weekday: 'long'` via en-GB + abbreviated month + year). */
export function formatDisplayDateFromDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  const wd = date.toLocaleDateString("en-GB", { weekday: "long" });
  const d = date.getDate();
  const mo = UK_MONTHS_ABBR[date.getMonth()] ?? "";
  const y = date.getFullYear();
  return `${wd}, ${d} ${mo} ${y}`;
}

/**
 * Format an activity-style date string for display (British weekday long + abbreviated month)
 * via parseActivityDate; falls back to ISO/Date parsing, otherwise returns original.
 */
export function formatDisplayDateFromString(raw: string): string {
  if (!raw) return "";
  const parsed = parseActivityDate(raw);
  if (parsed.length > 0) {
    return formatDisplayDateFromDate(parsed[0]);
  }
  // Fallback: ISO-like string (e.g. 2026-08-15)
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return formatDisplayDateFromDate(d);
  }
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return formatDisplayDateFromDate(d);
  } catch {
    // ignore
  }
  return raw;
}

