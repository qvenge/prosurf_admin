import styles from './SessionDetails.module.scss';
import { Button } from '@/shared/ui';
import { useSession, type Booking } from '@/shared/api';
import { formatDate, formatTime, formatPrice } from '@/shared/lib/format-utils';

export interface SessionDetailsProps {
  sessionId: string;
}

interface TempBooking extends Booking {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export function SessionDetails({ sessionId }: SessionDetailsProps) {
  const { data } = useSession(sessionId);

  const bookings: TempBooking[] = [];

  if (!data) return null;

  return (
    <div className={styles.contrainer}>
      <div className={styles.header}>
        <div className={styles.datetime}>{formatDate(data.startsAt)} в {formatTime(data.startsAt)}</div>
        <div className={styles.title}>{data.event.title}</div>
        <div className={styles.location}>{data.event.location}</div>
      </div>
      <div className={styles.bookings}>
        <div className={styles.bookingsHeader}>
          <div className={styles.bookingsCount}>Записей: {bookings.length}</div>
          <div className={styles.spacer} />
          <Button type="primary" size="s" onClick={() => { /* TODO: Add functionality */ }}>
            Добавить запись
          </Button>
        </div>
        <div className={styles.bookingsList}>
          {bookings.map(booking => (
            <div key={booking.id} className={styles.booking}>
              <div className={styles.bookingUser}>
                {booking.user?.firstName} {booking.user?.lastName}
              </div>
              <div className={styles.bookingTicket}>
                Количество мест: {booking.quantity} | Статус: {booking.status}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.capacity}>
          Вместимость: {data.capacity} чел.
        </div>
        <div className={styles.price}>
          Цена от: {data.event.tickets.length > 0
            ? formatPrice(data.event.tickets.map(ticket => ticket.full.price).reduce((minPrice, price) => {
                return price.amountMinor < minPrice.amountMinor ? price : minPrice;
              }))
            : 'Бесплатно'}
        </div>
      </div>
    </div>
  );
}