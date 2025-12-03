import { APP_TIMEZONE } from './timezone';

export const getCurrentAndNextMonth = () => {
  const now = new Date();
  const currentMonth = now.toLocaleDateString('ru-RU', { month: 'long', timeZone: APP_TIMEZONE });
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1).toLocaleDateString('ru-RU', { month: 'long', timeZone: APP_TIMEZONE });
  return {
    current: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
    next: nextMonth.charAt(0).toUpperCase() + nextMonth.slice(1)
  };
};

export const getMonthDateRange = (monthName: string) => {
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('ru-RU', { month: 'long', timeZone: APP_TIMEZONE });
  const isCurrentMonth = monthName.toLowerCase() === currentMonthName;
  
  const targetDate = isCurrentMonth ? now : new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  const dateFrom = new Date(year, month, 1).toISOString();
  const dateTo = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  
  return { dateFrom, dateTo };
};

export const formatTourDates = (start: string, end: string | null) => {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : startDate;

  const startDay = parseInt(startDate.toLocaleDateString('ru-RU', { day: 'numeric', timeZone: APP_TIMEZONE }));
  const endDay = parseInt(endDate.toLocaleDateString('ru-RU', { day: 'numeric', timeZone: APP_TIMEZONE }));

  const startMonth = startDate.toLocaleDateString('ru-RU', { month: 'long', timeZone: APP_TIMEZONE });
  const endMonth = endDate.toLocaleDateString('ru-RU', { month: 'long', timeZone: APP_TIMEZONE });

  const year = startDate.toLocaleDateString('ru-RU', { year: 'numeric', timeZone: APP_TIMEZONE });
  
  if (startMonth === endMonth) {
    return {
      dates: `${startDay} – ${endDay} ${startMonth}`,
      year: `${year} г`
    };
  } else {
    return {
      dates: `${startDay} ${startMonth} – ${endDay} ${endMonth}`,
      year: `${year} г`
    };
  }
};

export const formatTime = (datetime: string) => {
  const date = new Date(datetime);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: APP_TIMEZONE
  });
};

export const formatEventDate = (datetime: string) => {
  const date = new Date(datetime);
  const day = date.toLocaleDateString('ru-RU', { day: 'numeric', timeZone: APP_TIMEZONE });
  const month = date.toLocaleDateString('ru-RU', { month: 'long', timeZone: APP_TIMEZONE });
  const weekday = date.toLocaleDateString('ru-RU', { weekday: 'long', timeZone: APP_TIMEZONE });

  return `${day} ${month} • ${weekday}`;
};

export const groupEventsByDate = <T extends { start: string }>(events: T[]) => {
  const grouped = events.reduce((acc, event) => {
    const dateKey = new Date(event.start).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, T[]>);

  return Object.entries(grouped).map(([, events]) => ({
    date: formatEventDate(events[0].start),
    events
  }));
};