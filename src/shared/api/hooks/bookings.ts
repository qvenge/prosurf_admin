import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { bookingsClient } from '../clients/bookings';
import { sessionsKeys } from './sessions';
import { REFRESH_INTERVALS } from '../config/refresh-intervals';
import type {
  Booking,
  BookingExtended,
  BookRequest,
  BookingFilters,
  PaginatedResponse,
  IdempotencyKey,
  CreateBookingPaymentDto
} from '../types';

export const bookingsKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingsKeys.all, 'list'] as const,
  list: (filters?: BookingFilters) => [...bookingsKeys.lists(), filters] as const,
  details: () => [...bookingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingsKeys.details(), id] as const,
} as const;

export const useBookSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
      idempotencyKey
    }: {
      sessionId: string;
      data: BookRequest;
      idempotencyKey: IdempotencyKey;
    }) => bookingsClient.bookSession(sessionId, data, idempotencyKey),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(bookingsKeys.detail(result.booking.id), result.booking);
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionsKeys.detail(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to book session:', error);
    },
  });
};

type HasExtendedFields<T extends BookingFilters | undefined> = T extends BookingFilters
  ? T['includeUser'] extends true
    ? true
    : T['includeSession'] extends true
    ? true
    : T['includePaymentInfo'] extends true
    ? true
    : T['includeGuestContact'] extends true
    ? true
    : false
  : false;

export function useBookings<T extends BookingFilters | undefined = undefined>(
  filters?: T
): HasExtendedFields<T> extends true
  ? ReturnType<typeof useQuery<PaginatedResponse<BookingExtended>>>
  : ReturnType<typeof useQuery<PaginatedResponse<Booking>>> {
  return useQuery({
    queryKey: bookingsKeys.list(filters),
    queryFn: () => bookingsClient.getBookings(filters),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.BOOKINGS,
    refetchIntervalInBackground: false,
  }) as any;
}

export const useBookingsInfinite = (filters?: Omit<BookingFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: bookingsKeys.list(filters),
    queryFn: ({ pageParam }) => bookingsClient.getBookings({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Booking>) => lastPage.next,
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.BOOKINGS,
    refetchIntervalInBackground: false,
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingsKeys.detail(id),
    queryFn: () => bookingsClient.getBookingById(id),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.BOOKINGS,
    refetchIntervalInBackground: false,
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsClient.cancelBooking(id),
    onSuccess: (cancelledBooking, bookingId) => {
      queryClient.setQueryData(bookingsKeys.detail(bookingId), cancelledBooking);
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionsKeys.detail(cancelledBooking.sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to cancel booking:', error);
    },
  });
};

export const useConfirmBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsClient.confirmBooking(id),
    onSuccess: (confirmedBooking, bookingId) => {
      queryClient.setQueryData(bookingsKeys.detail(bookingId), confirmedBooking);
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to confirm booking:', error);
    },
  });
};

export const useMarkBookingAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsClient.markBookingAsPaid(id),
    onSuccess: (paidBooking, bookingId) => {
      queryClient.setQueryData(bookingsKeys.detail(bookingId), paidBooking);
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to mark booking as paid:', error);
    },
  });
};

export const useClientBookings = (clientId: string | null) => {
  return useQuery({
    queryKey: bookingsKeys.list({ clientId: clientId! }),
    queryFn: () => bookingsClient.getBookings({ clientId: clientId! }),
    enabled: Boolean(clientId),
    staleTime: 10 * 1000,
    refetchInterval: REFRESH_INTERVALS.BOOKINGS,
    refetchIntervalInBackground: false,
  });
};

export const useActiveClientBookings = (clientId: string | null) => {
  const { data, ...rest } = useClientBookings(clientId);

  return {
    data: data ? {
      ...data,
      items: data.items.filter(booking =>
        booking.status === 'HOLD' || booking.status === 'CONFIRMED'
      ),
    } : undefined,
    ...rest,
  };
};

export const useExpiredClientBookings = (clientId: string | null) => {
  const { data, ...rest } = useClientBookings(clientId);

  return {
    data: data ? {
      ...data,
      items: data.items.filter(booking => booking.status === 'EXPIRED'),
    } : undefined,
    ...rest,
  };
};

export const useCancelledClientBookings = (clientId: string | null) => {
  const { data, ...rest } = useClientBookings(clientId);

  return {
    data: data ? {
      ...data,
      items: data.items.filter(booking => booking.status === 'CANCELLED'),
    } : undefined,
    ...rest,
  };
};

/** @deprecated Используйте useClientBookings */
export const useCurrentUserBookings = () => useClientBookings(null);

/** @deprecated Используйте useActiveClientBookings */
export const useActiveBookings = () => useActiveClientBookings(null);

/** @deprecated Используйте useExpiredClientBookings */
export const useExpiredBookings = () => useExpiredClientBookings(null);

/** @deprecated Используйте useCancelledClientBookings */
export const useCancelledBookings = () => useCancelledClientBookings(null);

export const useCreateBookingPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      data,
      idempotencyKey
    }: {
      bookingId: string;
      data: CreateBookingPaymentDto;
      idempotencyKey: IdempotencyKey;
    }) => bookingsClient.createPayment(bookingId, data, idempotencyKey),
    onSuccess: (_payment, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.detail(variables.bookingId) });
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to create payment for booking:', error);
    },
  });
};