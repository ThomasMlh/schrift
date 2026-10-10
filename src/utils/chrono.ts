// Chronos des vagues d'un build : stockés en secondes au millième près (56.598).

/** "56.598 s" sous une minute, "1:02.345" au-delà. */
export const formatChrono = (seconds?: number | null): string => {
  if (seconds == null || !Number.isFinite(seconds)) return "—";
  if (seconds < 60) return `${seconds.toFixed(3)} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  return `${minutes}:${rest.toFixed(3).padStart(6, "0")}`;
};

/**
 * Lit une saisie de chrono : "56.598", "56,598" ou "1:02.345". Renvoie les secondes, null si le
 * champ est vide, ou NaN si la saisie est invalide.
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

/** Valeur initiale du champ de saisie à partir des secondes stockées. */
export const chronoInputValue = (seconds?: number | null): string =>
  seconds == null ? "" : seconds < 60 ? String(seconds) : formatChrono(seconds);
