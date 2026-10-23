// "DD/MM/YYYY" to a local date, or null when the string is not a date
export const parseFrenchDate = (value: string): Date | null => {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};
