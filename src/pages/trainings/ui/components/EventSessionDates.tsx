import { useMemo } from 'react';
import { useEventSessions } from '@/shared/api';
import { formatDate, formatTime } from '@/shared/lib/format-utils';
import styles from './EventSessionDates.module.scss';

interface EventSessionDatesProps {
  eventId: string;
}

export function EventSessionDates({ eventId }: EventSessionDatesProps) {
  const { data: sessionsData, isLoading, error } = useEventSessions(eventId);

  const sessionDates = useMemo(() => {
    if (!sessionsData?.items) return [];

    // Group sessions by date
    const sessionsByDate: Record<string, string[]> = {};
    sessionsData.items.forEach(session => {
      const date = formatDate(session.startsAt);
      const time = formatTime(session.startsAt);

      if (!sessionsByDate[date]) {
        sessionsByDate[date] = [];
      }
      sessionsByDate[date].push(time);
    });

    // Convert to array and sort
    return Object.entries(sessionsByDate)
      .map(([date, times]) => ({
        date,
        times: times.sort() // Sort times within each day
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date
  }, [sessionsData]);

  if (isLoading) {
    return <span className={styles.loading}>Загрузка дат...</span>;
  }

  if (error) {
    return <span className={styles.error}>Ошибка загрузки дат</span>;
  }

  if (!sessionDates || sessionDates.length === 0) {
    return <span>Даты не указаны</span>;
  }

  return (
    <div className={styles.dates}>
      {sessionDates.slice(0, 3).map((dateGroup, index) => (
        <div key={index} className={styles.date}>
          <div className={styles.dateDay}>{dateGroup.date}</div>
          <div className={styles.dateTimes}>{dateGroup.times.join(' / ')}</div>
        </div>
      ))}
      {sessionDates.length > 3 && (
        <div className={styles.date}>
          <div className={styles.dateTime}>+{sessionDates.length - 3} ещё дней</div>
        </div>
      )}
    </div>
  );
}