import type { Client, BookingExtended, PaymentInfoItem } from '@/shared/api';
import { useBookings } from '@/shared/api';
import { Icon, Loader } from '@/shared/ui';
import { BarbellBold, ConfettiBold } from '@/shared/ds/icons';
import { AirplaneTiltFill } from '@/shared/ds/icons/_index';
import { formatDate, formatTime } from '@/shared/lib/format-utils';
import styles from './BookingHistory.module.scss';

export interface BookingHistoryProps {
  client: Client;
}

const formatPrice = (amountMinor: number): string => {
  return `${(amountMinor / 100).toLocaleString('ru-RU')} ₽`;
};

function getEventTypeInfo(labels?: string[]): { icon: string; label: string } {
  if (labels?.includes('tour')) {
    return { icon: AirplaneTiltFill, label: 'Тур' };
  }
  if (labels?.includes('activity')) {
    return { icon: ConfettiBold, label: 'Ивент' };
  }
  if (labels?.includes('training:surfskate')) {
    return { icon: BarbellBold, label: 'Серфскейт' };
  }
  // Default: training:surfing or any other
  return { icon: BarbellBold, label: 'Серфинг' };
}

type BookingStatusType = 'HOLD' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

interface StatusInfo {
  label: string;
  styleKey: 'hold' | 'confirmed' | 'cancelled' | 'expired';
  showPayment: boolean;
}

function getStatusInfo(status: BookingStatusType): StatusInfo {
  switch (status) {
    case 'HOLD':
      return { label: 'Ожидает оплаты', styleKey: 'hold', showPayment: false };
    case 'CONFIRMED':
      return { label: 'Подтверждено', styleKey: 'confirmed', showPayment: true };
    case 'CANCELLED':
      return { label: 'Отменено', styleKey: 'cancelled', showPayment: false };
    case 'EXPIRED':
      return { label: 'Истекло', styleKey: 'expired', showPayment: false };
    default:
      return { label: status, styleKey: 'hold', showPayment: false };
  }
}

function getPaymentLabel(paymentInfo?: BookingExtended['paymentInfo']): string | null {
  // Если нет paymentInfo - это офлайн оплата
  if (!paymentInfo) return 'Оплачено (офлайн)';

  // Если пустой массив - тоже офлайн
  if (Array.isArray(paymentInfo) && paymentInfo.length === 0) return 'Оплачено (офлайн)';

  // Если paymentInfo - массив (composite payment)
  if (Array.isArray(paymentInfo) && paymentInfo.length > 0) {
    const payments = paymentInfo as PaymentInfoItem[];
    const passPayment = payments.find(p => p.method === 'pass');
    if (passPayment?.seasonTicketId) {
      return 'Абонемент';
    }

    const bonusPayment = payments.find(p => p.method === 'bonus');
    const totalPaid = payments.reduce((sum, p) => sum + (p.amountMinor || 0), 0);

    if (bonusPayment?.amountMinor && totalPaid > 0) {
      return `${formatPrice(totalPaid)} (${formatPrice(bonusPayment.amountMinor)} бонусами)`;
    }
    if (totalPaid > 0) {
      return formatPrice(totalPaid);
    }
    return null;
  }

  // Если paymentInfo - объект (single payment)
  if (typeof paymentInfo === 'object' && 'method' in paymentInfo) {
    const payment = paymentInfo as PaymentInfoItem;
    if (payment.seasonTicketId) {
      return 'Абонемент';
    }
    if (payment.amountMinor) {
      return formatPrice(payment.amountMinor);
    }
  }

  return null;
}

export function BookingHistory({ client }: BookingHistoryProps) {
  const { data, isLoading, error } = useBookings({
    clientId: client.id,
    includeSession: true,
    includePaymentInfo: true,
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

        const statusInfo = getStatusInfo(booking.status as BookingStatusType);
        const isInactive = booking.status === 'CANCELLED' || booking.status === 'EXPIRED';

        return (
          <div key={booking.id} className={`${styles.card} ${isInactive ? styles.inactive : ''}`}>
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
              {statusInfo.showPayment && paymentLabel ? (
                <span className={styles.paymentLabel}>{paymentLabel}</span>
              ) : (
                <span className={styles[`statusLabel_${statusInfo.styleKey}`]}>{statusInfo.label}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
