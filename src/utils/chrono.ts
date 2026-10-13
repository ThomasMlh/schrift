// Build wave times, stored in seconds with millisecond precision (56.598).

/** "56.598 s" under a minute, "1:02.345" above. */
export const formatChrono = (seconds?: number | null): string => {
  if (seconds == null || !Number.isFinite(seconds)) return "—";
  if (seconds < 60) return `${seconds.toFixed(3)} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  return `${minutes}:${rest.toFixed(3).padStart(6, "0")}`;
};

/**
 * Parses a time input: "56.598", "56,598" or "1:02.345". Returns seconds, null when the field is
 * empty, or NaN when the input is invalid.
 */
export const parseChrono = (input: string): number | null => {
  const value = input.trim().replace(",", ".");
  if (!value) return null;
  const match = value.match(/^(?:(\d+):)?(\d+(?:\.\d{1,3})?)$/);
  if (!match) return NaN;
  const minutes = match[1] ? Number(match[1]) : 0;
  const seconds = Number(match[2]);
  if (match[1] && seconds >= 60) return NaN;
  return Math.round((minutes * 60 + seconds) * 1000) / 1000;
};

/** Initial input value from the stored seconds. */
export const chronoInputValue = (seconds?: number | null): string =>
  seconds == null ? "" : seconds < 60 ? String(seconds) : formatChrono(seconds);
