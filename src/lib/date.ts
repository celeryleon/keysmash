// Daily ritual rotates at midnight America/New_York. See PRD §4.1.
const APP_TIMEZONE = "America/New_York";

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getTodayDate(now: Date = new Date()): string {
  return formatter.format(now);
}
