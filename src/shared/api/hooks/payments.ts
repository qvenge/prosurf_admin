import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsClient } from '../clients/payments';
import { bookingsKeys } from './bookings';

import type {
  Payment,
  PaymentMethodRequest,
  CompositePaymentMethodRequest,
  RefundRequest,
  IdempotencyKey
} from '../types';

// Query key factory for payments
export const paymentsKeys = {
  all: ['payments'] as const,
  details: () => [...paymentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentsKeys.details(), id] as const,
  refunds: (paymentId: string) => [...paymentsKeys.detail(paymentId), 'refunds'] as const,
} as const;

/**
 * Payments hooks
 */

// Create payment mutation
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      bookingId, 
      data, 
      idempotencyKey 
    }: { 
      bookingId: string; 
      data: PaymentMethodRequest | CompositePaymentMethodRequest;
      idempotencyKey: IdempotencyKey;
    }) => paymentsClient.createPayment(bookingId, data, idempotencyKey),
    onSuccess: (newPayment, variables) => {
      // Add payment to cache
      queryClient.setQueryData(paymentsKeys.detail(newPayment.id), newPayment);
      
      // Invalidate booking to reflect payment status
      queryClient.invalidateQueries({ queryKey: bookingsKeys.detail(variables.bookingId) });
    },
    onError: (error) => {
      console.error('Failed to create payment:', error);
    },
  });
};

// Get payment by ID
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: paymentsKeys.detail(id),
    queryFn: () => paymentsClient.getPaymentById(id),
    staleTime: 30 * 1000, // 30 seconds (payment status changes frequently)
  });
};

// Create refund mutation
export const useCreateRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      paymentId, 
      data, 
      idempotencyKey 
    }: { 
      paymentId: string; 
      data?: RefundRequest;
      idempotencyKey?: IdempotencyKey;
    }) => paymentsClient.createRefund(paymentId, idempotencyKey || crypto.randomUUID(), data),
    onSuccess: (_, variables) => {
      // Invalidate payment to show refund status
      queryClient.invalidateQueries({ queryKey: paymentsKeys.detail(variables.paymentId) });
      
      // Invalidate related booking
      const payment = queryClient.getQueryData(paymentsKeys.detail(variables.paymentId)) as Payment;
      if (payment) {
        queryClient.invalidateQueries({ queryKey: bookingsKeys.detail(payment.bookingId) });
      }
    },
    onError: (error) => {
      console.error('Failed to create refund:', error);
    },
  });
};

// Hook for payment polling (useful for pending payments)
export const usePaymentPolling = (paymentId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: paymentsKeys.detail(paymentId),
    queryFn: () => paymentsClient.getPaymentById(paymentId),
    enabled,
    refetchInterval: (query) => {
      // Stop polling if payment is no longer pending
      if (query.state.data?.status !== 'PENDING') {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
    staleTime: 0, // Always fresh data when polling
  });
};

// Hook for handling payment next actions
export const usePaymentActions = () => {
  const handlePaymentAction = async (payment: Payment): Promise<void> => {
    if (!payment.nextAction) {
      return;
    }

    switch (payment.nextAction.type) {
      case 'openInvoice':
        // For Telegram Mini App
        console.warn('Not in Telegram environment, cannot open invoice');
        break;

      case 'redirect':
        // For external payment providers
        if (typeof window !== 'undefined') {
          window.open(payment.nextAction.url, '_blank');
        }
        break;

      case 'none':
        // Payment completed, no action needed
        break;
    }
  };

  return { handlePaymentAction };
};