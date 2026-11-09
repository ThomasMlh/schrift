const PARIS = "Europe/Paris";

// "lun. 02/11 16 h" / "Mon, 02/11 16:00", in Paris time like the game reset
export const formatRealDate = (date: Date, language: string) => {
  const locale = language.startsWith("en") ? "en-GB" : "fr-FR";
  const day = date.toLocaleDateString(locale, { timeZone: PARIS, weekday: "short", day: "2-digit", month: "2-digit" });
  const hour = date.toLocaleTimeString(locale, { timeZone: PARIS, hour: "2-digit", minute: "2-digit" }).replace(/:00$/, "");
  return locale === "fr-FR" ? `${day} ${hour.replace(/^0/, "")} h` : `${day} ${hour}:00`;
};
