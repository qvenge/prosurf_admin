export const APP_TIMEZONE = import.meta.env.VITE_TIMEZONE || 'Europe/Moscow';

/**
 * Convert local input (in app timezone) to UTC for API
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timeStr - Time string in HH:MM format
 * @returns Date object in UTC
 */
export function localInputToUTC(dateStr: string, timeStr: string): Date {
  // Create a date object from the input (browser interprets as local time)
  const localDateTime = new Date(`${dateStr}T${timeStr}:00`);

  // Get offset for app timezone using Intl API
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    timeZoneName: 'longOffset'
  });
  const parts = formatter.formatToParts(localDateTime);
  const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+00:00';
  const match = offsetPart.match(/GMT([+-])(\d{2}):(\d{2})/);

  if (!match) {
    // Fallback: treat as UTC
    return new Date(`${dateStr}T${timeStr}:00Z`);
  }

  const sign = match[1] === '+' ? -1 : 1; // Invert for UTC conversion
  const hours = parseInt(match[2]);
  const minutes = parseInt(match[3]);
  const totalOffsetMs = (hours * 60 + minutes) * 60 * 1000;

  // Create UTC date: subtract offset from local time
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) + sign * totalOffsetMs;

  return new Date(utcMs);
}
