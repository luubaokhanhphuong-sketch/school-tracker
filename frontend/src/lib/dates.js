import { format, parseISO, isSameDay, isBefore, differenceInCalendarDays } from "date-fns";

export function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  return format(d, "EEE, MMM d");
}

export function fmtLong(dateStr) {
  if (!dateStr) return "";
  const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  return format(d, "EEEE, MMMM d, yyyy");
}

export function fmtTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return format(d, "h:mm a").replace(":00", "");
}

export function isToday(dateStr) {
  return isSameDay(parseISO(dateStr), new Date());
}

export function isPast(dateStr) {
  return isBefore(parseISO(dateStr), new Date());
}

export function daysLeft(dateStr) {
  return differenceInCalendarDays(parseISO(dateStr), new Date());
}

export function hoursLabel(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}