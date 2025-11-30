import { useState } from 'react';
import styles from './SessionDetails.module.scss';
import { Button, Icon } from '@/shared/ui';
import { useSession, useBookings, type BookingExtended } from '@/shared/api';
import { formatDate, formatTime } from '@/shared/lib/format-utils';

import { AddBookingForm } from './AddBookingForm'
import { TrashRegular, UserRegular } from '@/shared/ds/icons';

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

  const getClientName = (booking: BookingExtended) => {
    if (booking.client?.firstName || booking.client?.lastName) {
      return `${booking.client.firstName || ''} ${booking.client.lastName || ''}`.trim();
    }
    if (booking.client?.username) {
      return `@${booking.client.username}`;
    }
    if (booking.guestContact?.firstName || booking.guestContact?.lastName) {
      return `${booking.guestContact.firstName || ''} ${booking.guestContact.lastName || ''}`.trim();
    }
    if (booking.guestContact?.phone) {
      return booking.guestContact.phone;
    }
    return 'Неизвестно';
  };

  const getPaymentMethodText = (booking: BookingExtended) => {
    const paymentInfo = booking.paymentInfo;

    // Check if paymentInfo is an object with method property (not an array)
    if (paymentInfo && typeof paymentInfo === 'object' && !Array.isArray(paymentInfo) && 'method' in paymentInfo) {
      const method = paymentInfo.method;
      switch (method) {
        case 'card':
          return 'Карта';
        case 'certificate':
          return 'Сертификат';
        case 'pass':
          return 'Абонемент';
        case 'cashback':
          return 'Кэшбэк';
        case 'composite':
          return 'Комбинированный';
        default:
          return 'Не оплачено';
      }
    }

    return 'Не оплачено';
  };

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
          {bookingsData?.items.length === 0 && <div>Нет записей</div>}
          {bookingsData?.items.length && bookingsData.items.map((booking) => (
            <div key={booking.id} className={styles.booking}>
              <div className={styles.bookingUserAvatarWrapper}>
                {booking.client?.photoUrl ? (
                  <img
                    className={styles.bookingUserAvatar}
                    src={booking.client.photoUrl}
                    alt="Avatar"
                  />
                ) : (
                  <Icon src={UserRegular} width={20} height={20} />
                )}
              </div>
              <div className={styles.bookingInfo}>
                <div className={styles.bookingUserName}>{getClientName(booking)}</div>
                <div className={styles.bookingPaymentMethod}>{getPaymentMethodText(booking)}</div>
              </div>
              <Icon className={styles.bookingCancelBtn} src={TrashRegular} width={20} height={20} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}