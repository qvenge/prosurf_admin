import { Button, TextButton, Icon } from '@/shared/ui';
import { CaretLeftBold, UserRegular } from '@/shared/ds/icons';
import {
  useMarkBookingAsPaid,
  useConfirmBooking,
  useCancelBooking,
  type BookingExtended,
  type PaymentInfoItem
} from '@/shared/api';
import { formatDate, formatTime } from '@/shared/lib/format-utils';
import styles from './SessionDetails.module.scss';

export interface BookingDetailsProps {
  booking: BookingExtended;
  onBack: () => void;
}

const formatPrice = (amountMinor: number): string => {
  return `${(amountMinor / 100).toLocaleString('ru-RU')} ₽`;
};

export function BookingDetails({ booking, onBack }: BookingDetailsProps) {
  const { mutate: markAsPaid, isPending: isMarkingPaid } = useMarkBookingAsPaid();
  const { mutate: confirmBooking, isPending: isConfirming } = useConfirmBooking();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

  const isActionPending = isMarkingPaid || isConfirming || isCancelling;

  const getClientName = () => {
    if (booking.user?.firstName || booking.user?.lastName) {
      return `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim();
    }
    if (booking.user?.username) {
      return `@${booking.user.username}`;
    }
    if (booking.guestContact?.firstName || booking.guestContact?.lastName) {
      return `${booking.guestContact.firstName || ''} ${booking.guestContact.lastName || ''}`.trim();
    }
    if (booking.guestContact?.phone) {
      return booking.guestContact.phone;
    }
    return 'Неизвестно';
  };

  const getBookingStatusText = (status: string) => {
    switch (status) {
      case 'HOLD':
        return 'Ожидание оплаты';
      case 'CONFIRMED':
        return 'Подтверждено';
      case 'CANCELLED':
        return 'Отменено';
      case 'EXPIRED':
        return 'Истекло';
      default:
        return status;
    }
  };

  const getPaymentStatusText = () => {
    if (booking.status === 'HOLD') {
      return 'Ожидает оплаты';
    }

    if (booking.status === 'EXPIRED') {
      return 'Не оплачено';
    }

    if (booking.status === 'CANCELLED') {
      return '';
    }

    if (!booking.isPaid) {
      return 'Не оплачено';
    }

    const paymentInfo = booking.paymentInfo;

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
    }

    // Если paymentInfo - объект (single payment)
    if (paymentInfo && typeof paymentInfo === 'object' && !Array.isArray(paymentInfo) && 'method' in paymentInfo) {
      const payment = paymentInfo as PaymentInfoItem;
      if (payment.method === 'pass') {
        return 'Абонемент';
      }
      if (payment.amountMinor) {
        return formatPrice(payment.amountMinor);
      }
    }

    return 'Оплачено (офлайн)';
  };

  const getPaymentDate = (): string | null => {
    const paymentInfo = booking.paymentInfo;

    if (Array.isArray(paymentInfo) && paymentInfo.length > 0) {
      const firstPayment = paymentInfo[0] as PaymentInfoItem;
      if (firstPayment.paidAt) {
        return `${formatDate(firstPayment.paidAt)}, ${formatTime(firstPayment.paidAt)}`;
      }
    }

    if (paymentInfo && typeof paymentInfo === 'object' && !Array.isArray(paymentInfo) && 'paidAt' in paymentInfo) {
      const payment = paymentInfo as PaymentInfoItem;
      if (payment.paidAt) {
        return `${formatDate(payment.paidAt)}, ${formatTime(payment.paidAt)}`;
      }
    }

    return null;
  };

  const handleConfirm = () => {
    confirmBooking(booking.id, {
      onSuccess: onBack
    });
  };

  const handleMarkAsPaid = () => {
    markAsPaid(booking.id, {
      onSuccess: onBack
    });
  };

  const handleCancel = () => {
    cancelBooking(booking.id, {
      onSuccess: onBack
    });
  };

  const isPaid = booking.status === 'CONFIRMED' && booking.isPaid;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TextButton type="secondary" size="m" onClick={onBack}>
          <Icon src={CaretLeftBold} width={20} height={20} /> Назад
        </TextButton>
      </div>

      <div className={styles.bookingDetailsContent}>
        <div className={styles.bookingDetailsClient}>
          <div className={styles.bookingUserAvatarWrapper}>
            {booking.user?.photoUrl ? (
              <img
                className={styles.bookingUserAvatar}
                src={booking.user.photoUrl}
                alt="Avatar"
              />
            ) : (
              <Icon src={UserRegular} width={20} height={20} />
            )}
          </div>
          <div className={styles.bookingDetailsClientInfo}>
            <div className={styles.bookingDetailsClientName}>{getClientName()}</div>
            {booking.user?.phone && (
              <div className={styles.bookingDetailsClientPhone}>{booking.user.phone}</div>
            )}
            {booking.guestContact?.phone && !booking.user?.phone && (
              <div className={styles.bookingDetailsClientPhone}>{booking.guestContact.phone}</div>
            )}
          </div>
        </div>

        <div className={styles.bookingDetailsInfo}>
          <div className={styles.bookingDetailsRow}>
            <span className={styles.bookingDetailsLabel}>Статус</span>
            <span className={styles.bookingDetailsValue} data-status={booking.status}>
              {getBookingStatusText(booking.status)}
            </span>
          </div>
          <div className={styles.bookingDetailsRow}>
            <span className={styles.bookingDetailsLabel}>Сумма</span>
            <span className={styles.bookingDetailsValue}>
              {formatPrice(booking.totalPrice.amountMinor)}
            </span>
          </div>
          <div className={styles.bookingDetailsRow}>
            <span className={styles.bookingDetailsLabel}>Оплата</span>
            <span
              className={styles.bookingDetailsValue}
              data-payment={isPaid ? 'paid' : 'unpaid'}
            >
              {getPaymentStatusText()}
            </span>
          </div>
          {isPaid && getPaymentDate() && (
            <div className={styles.bookingDetailsRow}>
              <span className={styles.bookingDetailsLabel}>Дата оплаты</span>
              <span className={styles.bookingDetailsValue}>
                {getPaymentDate()}
              </span>
            </div>
          )}
          <div className={styles.bookingDetailsRow}>
            <span className={styles.bookingDetailsLabel}>Количество</span>
            <span className={styles.bookingDetailsValue}>{booking.quantity}</span>
          </div>
        </div>
      </div>

      <div className={styles.bookingDetailsActions}>
        {booking.status === 'HOLD' && (
          <Button
            type="primary"
            size="l"
            streched
            onClick={handleConfirm}
            disabled={isActionPending}
            loading={isConfirming}
          >
            Подтвердить
          </Button>
        )}
        {booking.status === 'CONFIRMED' && !booking.isPaid && (
          <Button
            type="primary"
            size="l"
            streched
            onClick={handleMarkAsPaid}
            disabled={isActionPending}
            loading={isMarkingPaid}
          >
            Отметить как оплачено
          </Button>
        )}
        {(booking.status === 'HOLD' || booking.status === 'CONFIRMED') && (
          <Button
            className={styles.cancelButton}
            type="secondary"
            size="l"
            streched
            onClick={handleCancel}
            disabled={isActionPending}
            loading={isCancelling}
          >
            Отменить бронирование
          </Button>
        )}
      </div>
    </div>
  );
}
