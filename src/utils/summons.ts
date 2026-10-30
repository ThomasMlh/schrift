const DAY_MS = 24 * 60 * 60 * 1000;

interface SummonDates {
  start_date: string | null;
  end_date: string | null;
}

// Summon dates are stored as DD/MM/YYYY
export const summonTime = (date: string | null) => {
  const [day, month, year] = (date ?? "").split("/").map(Number);
  return year ? new Date(year, month - 1, day).getTime() : 0;
};

export const summonDateRange = (summon: SummonDates) => (
  summon.end_date ? `${summon.start_date} → ${summon.end_date}` : summon.start_date
);

// A summon with no end date never expires
export const isSummonOngoing = (summon: SummonDates) => {
  const now = Date.now();
  const start = summonTime(summon.start_date);
  const end = summonTime(summon.end_date);
  return start > 0 && start <= now && (!summon.end_date || now < end + DAY_MS);
};

export const relativeTime = (time: number, language: string) => {
  const format = new Intl.RelativeTimeFormat(language.slice(0, 2), { numeric: "auto" });
  const days = Math.round((time - Date.now()) / DAY_MS);
  if (Math.abs(days) < 31) return format.format(days, "day");
  const months = Math.round(days / 30.44);
  return Math.abs(months) < 12 ? format.format(months, "month") : format.format(Math.round(months / 12), "year");
};
