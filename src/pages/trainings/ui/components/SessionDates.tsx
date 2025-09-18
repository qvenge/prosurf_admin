import { useEventSessions, type Event } from '@/shared/api';
import styles from './SessionDates.module.scss';

interface SessionDatesProps {
  event: Event;
}

export function SessionDates({ event }: SessionDatesProps) {
  const { data: sessionsData, isLoading } = useEventSessions(event.id, {
    limit: 50,
  });

  if (isLoading) {
    return <span className={styles.loading}>Loading...</span>;
  }

  if (!sessionsData?.items || sessionsData.items.length === 0) {
    return <span className={styles.noSessions}>No sessions</span>;
  }

  const formattedDates = sessionsData.items
    .map(session => {
      const startDate = new Date(session.startsAt);
      return startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    })
    .slice(0, 3);

  const hasMore = sessionsData.items.length > 3;

  return (
    <div className={styles.sessionDates}>
      {formattedDates.map((date, index) => (
        <span key={index} className={styles.date}>
          {date}
        </span>
      ))}
      {hasMore && (
        <span className={styles.moreIndicator}>
          +{sessionsData.items.length - 3} more
        </span>
      )}
    </div>
  );
}