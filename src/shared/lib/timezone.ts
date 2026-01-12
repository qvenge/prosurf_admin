export const APP_TIMEZONE = import.meta.env.VITE_TIMEZONE || 'Europe/Moscow';

/**
 * Конвертирует локальный ввод (в часовом поясе приложения) в UTC для API.
 * @param dateStr - Строка даты в формате YYYY-MM-DD
 * @param timeStr - Строка времени в формате HH:MM
 * @returns Объект Date в UTC
 */
export function localInputToUTC(dateStr: string, timeStr: string): Date {
  const localDateTime = new Date(`${dateStr}T${timeStr}:00`);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    timeZoneName: 'longOffset'
  });
  const parts = formatter.formatToParts(localDateTime);
  const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+00:00';
  const match = offsetPart.match(/GMT([+-])(\d{2}):(\d{2})/);

  if (!match) {
    return new Date(`${dateStr}T${timeStr}:00Z`);
  }

  // Инвертируем знак для конвертации в UTC
  const sign = match[1] === '+' ? -1 : 1;
  const hours = parseInt(match[2]);
  const minutes = parseInt(match[3]);
  const totalOffsetMs = (hours * 60 + minutes) * 60 * 1000;

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) + sign * totalOffsetMs;

  return new Date(utcMs);
}
