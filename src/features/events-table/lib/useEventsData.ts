import { useMemo } from 'react';
import { useEventsInfinite, type Event } from '@/shared/api';
import { formatPrice } from '@/shared/lib/format-utils';

export type EventRowData = {
  id: string;
  title: string;
  status: 'ACTIVE' | 'CANCELLED';
  location: string | null | undefined;
  prepayment?: string | null;
  price: string | null;
  capacity?: number;
};

interface UseEventsDataProps {
  eventType?: string;
}

export function useEventsData({ eventType }: UseEventsDataProps = {}) {
  const {
    data: _eventsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useEventsInfinite(
    eventType
      ? { limit: 15, 'labels.any': [eventType] }
      : { limit: 15 }
  );

  const eventsData: EventRowData[]  = useMemo(() => {
    if (!_eventsData?.pages) return [];

    const allEvents = _eventsData.pages.flatMap(page => page.items);

    return allEvents.map((event: Event) => {
      const ticket = event.tickets.length > 0
        ? event.tickets.reduce((minTicket, ticket) => {
            if (ticket.full.price.amountMinor < minTicket.full.price.amountMinor) {
              return ticket;
            }

            return minTicket;
          })
        : null;

      return {
        id: event.id,
        title: event.title,
        status: event.status ?? 'ACTIVE',
        location: event.location,
        prepayment: ticket?.prepayment?.price && ticket.prepayment.price.amountMinor > 0 ? formatPrice(ticket.prepayment.price) : null,
        price: ticket?.full.price && ticket.full.price.amountMinor > 0 ? formatPrice(ticket.full.price) : null,
        capacity: event.capacity ?? 0,
      };
    });
  }, [_eventsData]);

  return {
    eventsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
}