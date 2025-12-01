import type { Client, BookingExtended } from '@/shared/api';
import { useBookings } from '@/shared/api';
import { Icon, Loader } from '@/shared/ui';
import { BarbellFill, ConfettiFill } from '@/shared/ds/icons';
import { AirplaneTiltFill } from '@/shared/ds/icons/_index';
import styles from './BookingHistory.module.scss';

export interface BookingHistoryProps {
  client: Client;
}

function getEventTypeInfo(labels?: string[]): { icon: string; label: string } {
  if (labels?.includes('tour')) {
    return { icon: AirplaneTiltFill, label: 'Тур' };
  }
  if (labels?.includes('activity')) {
    return { icon: ConfettiFill, label: 'Ивент' };
  }
  if (labels?.includes('training:surfskate')) {
    return { icon: BarbellFill, label: 'Серфскейт' };
  }
  // Default: training:surfing or any other
  return { icon: BarbellFill, label: 'Серфинг' };
}

function getPaymentLabel(paymentInfo?: BookingExtended['paymentInfo']): string | null {
  if (!paymentInfo || Array.isArray(paymentInfo)) return null;

  if (paymentInfo.seasonTicketId) {
    return 'Абонемент';
  }

  return null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BookingHistory({ client }: BookingHistoryProps) {
  const { data, isLoading, error } = useBookings({
    clientId: client.id,
    includeSession: true,
    includePaymentInfo: true,
    status: 'CONFIRMED',
  });

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>Ошибка загрузки истории</div>;
  }

  const bookings = (data?.items ?? []) as BookingExtended[];

  if (bookings.length === 0) {
    return <div className={styles.empty}>История бронирований пуста</div>;
  }

  return (
    <div className={styles.root}>
      {bookings.map((booking) => {
        const session = booking.session;
        const event = session?.event;
        const labels = event?.labels ?? session?.effectiveLabels ?? [];
        const { icon, label } = getEventTypeInfo(labels);
        const paymentLabel = getPaymentLabel(booking.paymentInfo);

        return (
          <div key={booking.id} className={styles.card}>
            <div className={styles.info}>
              <div className={styles.badge}>
                <Icon src={icon} width={20} height={20} />
                <span className={styles.badgeLabel}>{label}</span>
              </div>
              <div className={styles.details}>
                <span className={styles.title}>{event?.title ?? 'Без названия'}</span>
                {event?.location && (
                  <span className={styles.location}>{event.location}</span>
                )}
              </div>
            </div>
            <div className={styles.dateSection}>
              {session?.startsAt && (
                <>
                  <span className={styles.date}>{formatDate(session.startsAt)}</span>
                  <span className={styles.time}>{formatTime(session.startsAt)}</span>
                </>
              )}
              {paymentLabel && (
                <span className={styles.paymentLabel}>{paymentLabel}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
