import { useEventSessions, type Event } from '@/shared/api';
import styles from './TotalSeats.module.scss';

interface TotalSeatsProps {
  event: Event;
}

export function TotalSeats({ event }: TotalSeatsProps) {
  const { data: sessionsData, isLoading } = useEventSessions(event.id, {
    limit: 100,
  });

  if (isLoading) {
    return <span className={styles.loading}>...</span>;
  }

  if (!sessionsData?.items || sessionsData.items.length === 0) {
    return <span className={styles.noSessions}>-</span>;
  }

  const totalCapacity = sessionsData.items.reduce((sum, session) => sum + session.capacity, 0);

  return (
    <span className={styles.totalSeats}>
      {totalCapacity}
    </span>
  );
}