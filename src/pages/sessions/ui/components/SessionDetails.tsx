import { useState } from 'react';
import styles from './SessionDetails.module.scss';
import { Button } from '@/shared/ui';
import { useSession, useBookings } from '@/shared/api';
import { formatDate, formatTime } from '@/shared/lib/format-utils';

import { AddBookingForm } from './AddBookingForm'

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
    limit: 100,
  });
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);

  if (!data) return null;

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
          <div className={styles.bookingsCount}>Записи: {`${data.capacity - data.remainingSeats} из ${data.capacity}`}</div>
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
          {bookingsData?.items.map((booking) => {
            const userName = booking.user
              ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim() || booking.user.username || booking.user.email
              : booking.guestContact
                ? `${booking.guestContact.firstName || ''} ${booking.guestContact.lastName || ''}`.trim() || booking.guestContact.phone
                : 'Неизвестный пользователь';

            const paymentMethod = booking.paymentInfo?.method || 'Не указан';

            return (
              <div key={booking.id} className={styles.bookingItem}>
                <div className={styles.bookingUser}>{userName}</div>
                <div className={styles.bookingDetails}>
                  <span className={styles.bookingQuantity}>Мест: {booking.quantity}</span>
                  <span className={styles.bookingStatus}>Статус: {booking.status}</span>
                  <span className={styles.bookingPayment}>Оплата: {paymentMethod}</span>
                </div>
              </div>
            );
          })}
          {bookingsData?.items.length === 0 && !bookingsLoading && (
            <div className={styles.emptyBookings}>Нет записей</div>
          )}
        </div>
      </div>
    </div>
  );
}