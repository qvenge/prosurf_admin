import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { bookingsClient } from '../clients/bookings';
import { sessionsKeys } from './sessions';
import type {
  Booking,
  BookingExtended,
  BookRequest,
  BookingFilters,
  PaginatedResponse,
  IdempotencyKey,
  CreateBookingPaymentDto
} from '../types';

// Query key factory for bookings
export const bookingsKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingsKeys.all, 'list'] as const,
  list: (filters?: BookingFilters) => [...bookingsKeys.lists(), filters] as const,
  details: () => [...bookingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingsKeys.details(), id] as const,
} as const;

/**
 * Bookings hooks
 */

// Book session mutation
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
      // Add new booking to cache
      queryClient.setQueryData(bookingsKeys.detail(result.booking.id), result.booking);
      
      // Invalidate bookings lists
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
      
      // Invalidate and update the session to reflect reduced remaining seats
      queryClient.invalidateQueries({ queryKey: sessionsKeys.detail(variables.sessionId) });
      
      // Invalidate sessions lists as remainingSeats changed
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to book session:', error);
    },
  });
};

// Type helper to determine if extended fields are requested
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

// Get bookings list with proper return typing
export function useBookings<T extends BookingFilters | undefined = undefined>(
  filters?: T
): HasExtendedFields<T> extends true
  ? ReturnType<typeof useQuery<PaginatedResponse<BookingExtended>>>
  : ReturnType<typeof useQuery<PaginatedResponse<Booking>>> {
  return useQuery({
    queryKey: bookingsKeys.list(filters),
    queryFn: () => bookingsClient.getBookings(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  }) as any;
}

// Infinite query for bookings
export const useBookingsInfinite = (filters?: Omit<BookingFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: bookingsKeys.list(filters),
    queryFn: ({ pageParam }) => bookingsClient.getBookings({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Booking>) => lastPage.next,
    staleTime: 1 * 60 * 1000,
  });
};

// Get booking by ID
export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingsKeys.detail(id),
    queryFn: () => bookingsClient.getBookingById(id),
    staleTime: 30 * 1000, // 30 seconds (booking status changes frequently)
  });
};

// Cancel booking mutation
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bookingsClient.cancelBooking(id),
    onSuccess: (cancelledBooking, bookingId) => {
      // Update the specific booking in cache
      queryClient.setQueryData(bookingsKeys.detail(bookingId), cancelledBooking);
      
      // Invalidate bookings lists
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
      
      // Invalidate session data to reflect increased remaining seats
      queryClient.invalidateQueries({ queryKey: sessionsKeys.detail(cancelledBooking.sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to cancel booking:', error);
    },
  });
};

// Confirm booking mutation (ADMIN only)
export const useConfirmBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsClient.confirmBooking(id),
    onSuccess: (confirmedBooking, bookingId) => {
      // Update the specific booking in cache
      queryClient.setQueryData(bookingsKeys.detail(bookingId), confirmedBooking);

      // Invalidate bookings lists
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to confirm booking:', error);
    },
  });
};

// Mark booking as paid mutation (ADMIN only)
export const useMarkBookingAsPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingsClient.markBookingAsPaid(id),
    onSuccess: (paidBooking, bookingId) => {
      // Update the specific booking in cache
      queryClient.setQueryData(bookingsKeys.detail(bookingId), paidBooking);

      // Invalidate bookings lists
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to mark booking as paid:', error);
    },
  });
};

// Hook for client's bookings (for admin to view client's bookings)
export const useClientBookings = (clientId: string | null) => {
  return useQuery({
    queryKey: bookingsKeys.list({ clientId: clientId! }),
    queryFn: () => bookingsClient.getBookings({ clientId: clientId! }),
    enabled: Boolean(clientId),
    staleTime: 1 * 60 * 1000,
  });
};

// Hook for client's active bookings (HOLD or CONFIRMED)
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

// Hook for client's expired bookings
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

// Hook for client's cancelled bookings
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

// Legacy aliases for backward compatibility
/**
 * @deprecated Use useClientBookings instead
 */
export const useCurrentUserBookings = () => useClientBookings(null);

/**
 * @deprecated Use useActiveClientBookings instead
 */
export const useActiveBookings = () => useActiveClientBookings(null);

/**
 * @deprecated Use useExpiredClientBookings instead
 */
export const useExpiredBookings = () => useExpiredClientBookings(null);

/**
 * @deprecated Use useCancelledClientBookings instead
 */
export const useCancelledBookings = () => useCancelledClientBookings(null);

/**
 * Create payment for booking mutation
 * POST /bookings/{id}/payment
 */
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
      // Invalidate the booking to reflect payment status
      queryClient.invalidateQueries({ queryKey: bookingsKeys.detail(variables.bookingId) });

      // Invalidate bookings lists
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to create payment for booking:', error);
    },
  });
};