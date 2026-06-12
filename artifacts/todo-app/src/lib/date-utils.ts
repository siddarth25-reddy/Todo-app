import { format, isPast, isToday, isTomorrow } from "date-fns";

export function formatDueDate(dateString?: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return "Today";
  }
  if (isTomorrow(date)) {
    return "Tomorrow";
  }
  
  return format(date, "MMM d, yyyy");
}

export function isOverdue(dateString?: string | null) {
  if (!dateString) return false;
  const date = new Date(dateString);
  // Compare to end of today to not mark things due today as overdue yet
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return isPast(date) && date < endOfToday;
}
