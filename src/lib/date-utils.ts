export function parseTweetDate(dateStr: string): number {
  if (dateStr.includes("T") && dateStr.endsWith("Z")) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid ISO date format: ${dateStr}`);
    }
    return date.getTime(); // Returns timestamp in milliseconds UTC
  }

  const delimiter = dateStr.includes("/") ? "/" : "-";
  const [day, month, year] = dateStr.split(delimiter).map(Number);
  return Date.UTC(year, month - 1, day); // Timestamp for 00:00:00 UTC
}
