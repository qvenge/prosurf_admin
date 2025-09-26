import { useMemo } from 'react';
import { useEventsInfinite, type Event } from '@/shared/api';
import { formatPrice } from '@/shared/lib/format-utils';

export type EventRowData = {
  id: string;
  title: string;
  location: string | null | undefined;
  price: string | null;
  capacity?: number;
};

interface UseEventsDataProps {
  eventType: string;
}

export function useEventsData({ eventType }: UseEventsDataProps) {
  const {
    data: _eventsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useEventsInfinite({
    limit: 15,
    'labels.any': [eventType]
  });

  const eventsData = useMemo(() => {
    if (!_eventsData?.pages) return [];

    const allEvents = _eventsData.pages.flatMap(page => page.items);

    return allEvents.map((event: Event) => {
      const minPrice = event.tickets.length > 0
        ? event.tickets.map(ticket => ticket.full.price).reduce((minPrice, price) => {
            return price.amountMinor < minPrice.amountMinor ? price : minPrice;
          })
        : null;

      return {
        id: event.id,
        title: event.title,
        location: event.location,
        price: minPrice ? formatPrice(minPrice) : null,
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