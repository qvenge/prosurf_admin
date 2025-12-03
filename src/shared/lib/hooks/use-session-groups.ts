import { useMemo } from 'react';
import { formatDuration, formatAvailability, formatPrice } from '../format-utils';
import { APP_TIMEZONE } from '../timezone';
import type { Session } from '@/shared/api';

interface SessionItem {
  id: string;
  time: string;
  duration: string;
  title: string;
  location: string;
  price: string;
  availability: string;
}

interface SessionGroupProps {
  sessions: SessionItem[];
}

export const useSessionGroups = (sessions: Session[]) => {
  return useMemo(() => {
    if (!sessions.length) return [];

    const groupedSessions = sessions.reduce((groups, session) => {
      const sessionDate = new Date(session.startsAt);
      const dayName = sessionDate.toLocaleDateString('ru-RU', { weekday: 'long', timeZone: APP_TIMEZONE });
      const day = sessionDate.toLocaleDateString('ru-RU', { day: 'numeric', timeZone: APP_TIMEZONE });
      const monthName = sessionDate.toLocaleDateString('ru-RU', { month: 'long', timeZone: APP_TIMEZONE });
      const dateKey = `${dayName} • ${day} ${monthName}`;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      const ticket = session.event.tickets[0];
      const price = ticket?.prepayment?.price || { amountMinor: 0, currency: 'RUB' };
      const endsAt = session.endsAt || (new Date(new Date(session.startsAt).getTime() + 90 * 60 * 1000)).toISOString();

      groups[dateKey].push({
        id: session.id,
        time: new Date(session.startsAt).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: APP_TIMEZONE
        }),
        duration: formatDuration(session.startsAt, endsAt) ?? 'Не указано',
        title: session.event.title,
        location: session.event.location ?? 'Не указано',
        price: formatPrice(price),
        availability: formatAvailability(session.remainingSeats).text
      });

      return groups;
    }, {} as Record<string, SessionGroupProps['sessions']>);

    return Object.entries(groupedSessions).map(([dateHeader, sessions]) => ({
      dateHeader,
      sessions
    }));
  }, [sessions]);
};