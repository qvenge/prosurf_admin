import { useState } from 'react';
import styles from './SessionDetails.module.scss';
import { Button, Icon } from '@/shared/ui';
import {
  useSession,
  useBookings,
  type BookingExtended
} from '@/shared/api';
import { formatDate, formatTime } from '@/shared/lib/format-utils';

import { AddBookingForm } from './AddBookingForm';
import { BookingDetails } from './BookingDetails';
import { UserRegular, CaretRightBold } from '@/shared/ds/icons';

export interface SessionDetailsProps {
  sessionId: string;
}

export function SessionDetails({ sessionId }: SessionDetailsProps) {
  const { data } = useSession(sessionId);
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useBookings({
    sessionId,
    includeGuestContact: true,
    includeUser: true,
    includePaymentInfo: true,
    limit: 100
  });
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingExtended | null>(null);

  // Фильтруем EXPIRED бронирования - они не нужны в списке
  const activeBookings = bookingsData?.items.filter(b => b.status !== 'EXPIRED') ?? [];

  const getClientName = (booking: BookingExtended) => {
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

  const getPaymentStatusText = (booking: BookingExtended) => {
    // HOLD = оплата ещё не завершена
    if (booking.status === 'HOLD') {
      return 'Ожидает оплаты';
    }

    // EXPIRED = оплата не была произведена вовремя
    if (booking.status === 'EXPIRED') {
      return 'Не оплачено';
    }

    // CANCELLED = отменено
    if (booking.status === 'CANCELLED') {
      return '';
    }

    // CONFIRMED - смотрим на isPaid и paymentInfo
    if (!booking.isPaid) {
      return 'Не оплачено';
    }

    const paymentInfo = booking.paymentInfo;
    if (paymentInfo && typeof paymentInfo === 'object' && !Array.isArray(paymentInfo) && 'method' in paymentInfo) {
      if (paymentInfo.method === 'pass') {
        return 'Абонемент';
      }
    }

    return 'Оплачено';
  };

  const getBookingStatusText = (status: string) => {
    switch (status) {
      case 'HOLD':
        return 'Ожидание';
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

  if (!data) return null;

  if (selectedBooking) {
    return (
      <BookingDetails
        booking={selectedBooking}
        onBack={() => setSelectedBooking(null)}
      />
    );
  }

  if (isAddBookingOpen) {
    return (
      <AddBookingForm
        sessionId={sessionId}
        onBack={() => setIsAddBookingOpen(false)}
        onSuccess={() => {
          console.log('Booking created successfully');
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.datetime}>{formatDate(data.startsAt)} в {formatTime(data.startsAt)}</div>
        <div className={styles.title}>{data.event.title}</div>
        <div className={styles.location}>{data.event.location}</div>
      </div>
      <div className={styles.bookings}>
        <div className={styles.bookingsHeader}>
          <div className={styles.bookingsCount}>
            Записи: {(() => {
              const capacity = data.capacity ?? data.event.capacity;
              return capacity !== null && capacity !== undefined
                ? `${capacity - data.remainingSeats} из ${capacity}`
                : `${data.remainingSeats > 0 ? '?' : '0'} из ?`;
            })()}
          </div>
          <Button
            className={styles.addBookingButton}
            type="primary"
            size="s"
            onClick={() => { setIsAddBookingOpen(true); }}
          >
            Добавить запись
          </Button>
        </div>
        <div className={styles.bookingsList}>
          {bookingsLoading && <div>Загрузка записей...</div>}
          {bookingsError && <div>Ошибка загрузки записей</div>}
          {!bookingsLoading && !bookingsError && activeBookings.length === 0 && <div>Нет записей</div>}
          {activeBookings.map((booking) => (
            <div
              key={booking.id}
              className={styles.bookingClickable}
              onClick={() => setSelectedBooking(booking)}
            >
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
              <div className={styles.bookingInfo}>
                <div className={styles.bookingUserName}>{getClientName(booking)}</div>
                <div className={styles.bookingMeta}>
                  <span className={styles.bookingStatus} data-status={booking.status}>
                    {getBookingStatusText(booking.status)}
                  </span>
                  {booking.status !== 'CANCELLED' && (
                    <>
                      <span className={styles.bookingMetaSeparator}>•</span>
                      <span
                        className={styles.bookingPayment}
                        data-status={booking.status === 'CONFIRMED' && booking.isPaid ? 'paid' : 'unpaid'}
                      >
                        {getPaymentStatusText(booking)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Icon
                className={styles.bookingChevron}
                src={CaretRightBold}
                width={20}
                height={20}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}