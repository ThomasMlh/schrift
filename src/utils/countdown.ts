/** "2 j 04 h 12 min" in French, "2 d 04 h 12 min" in English (no day under 24 h) */
export const formatCountdown = (ms: number, language = "fr") => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = language.startsWith("en") ? "d" : "j";
  return days > 0
    ? `${days} ${day} ${pad(hours)} h ${pad(minutes)} min`
    : `${pad(hours)} h ${pad(minutes)} min`;
};
