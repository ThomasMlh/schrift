export const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return "N/A";
  return num.toLocaleString("fr-FR");
};

export const formatScore = (score: number | undefined | null): string => {
  if (score === undefined || score === null) return "N/A";
  if (score >= 1_000_000_000) return `${(score / 1_000_000_000).toFixed(2)}B`;
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(2)}M`;
  return formatNumber(score);
};

/** Chiffres groupés par 3 avec des virgules : 612480300 → "612,480,300" (saisie groupée, builds). */
export const formatWithCommas = (value: number | string): string =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
