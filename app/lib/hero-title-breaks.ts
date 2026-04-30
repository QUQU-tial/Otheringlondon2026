/**
 * Hero title balanced word breaks.
 * Inserts soft hyphens (U+00AD) so that when the browser wraps long words,
 * it breaks at visually balanced points (e.g. 4+3, 4+4, 5+4) instead of
 * leaving 1–2 characters on a line (e.g. BETWEE/N, FESTIVA/L).
 * Does not change wrap positions or layout—only where a word breaks when it wraps.
 */
const SOFT_HYPHEN = "\u00AD";

/**
 * Preferred break index for a word of given length:
 * - Never leave only 1 (or 2) chars on the continuation line.
 * - Prefer balanced splits: 4+3, 4+4, 5+4, 5+5, etc.
 */
function getBreakIndex(length: number): number {
  if (length < 6) return -1;
  if (length === 6) return 3; // 3+3
  // length >= 7: first part >= 4, second part >= 3; prefer balance
  const firstPart = Math.max(4, Math.min(length - 3, Math.ceil(length / 2)));
  return firstPart;
}

/**
 * Returns the text with soft hyphens inserted in long words at balanced positions.
 * Only affects break points inside words; wrap behavior and layout unchanged.
 */
export function heroTitleBalancedBreaks(text: string): string {
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      const len = token.length;
      const idx = getBreakIndex(len);
      if (idx <= 0 || idx >= len) return token;
      return token.slice(0, idx) + SOFT_HYPHEN + token.slice(idx);
    })
    .join("");
}
