import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsClient } from '../clients/payments';
import { bookingsKeys } from './bookings';

import type {
  Payment,
  CreateBookingPaymentDto,
  RefundRequest,
  IdempotencyKey
} from '../types';

export const paymentsKeys = {
  all: ['payments'] as const,
  details: () => [...paymentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentsKeys.details(), id] as const,
  refunds: (paymentId: string) => [...paymentsKeys.detail(paymentId), 'refunds'] as const,
} as const;

export const useCreatePayment = () => {
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
    }) => paymentsClient.createPayment(bookingId, data, idempotencyKey),
    onSuccess: (newPayment, variables) => {
      queryClient.setQueryData(paymentsKeys.detail(newPayment.id), newPayment);
      queryClient.invalidateQueries({ queryKey: bookingsKeys.detail(variables.bookingId) });
    },
    onError: (error) => {
      console.error('Failed to create payment:', error);
    },
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: paymentsKeys.detail(id),
    queryFn: () => paymentsClient.getPaymentById(id),
    staleTime: 30 * 1000,
  });
};

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
      queryClient.invalidateQueries({ queryKey: paymentsKeys.detail(variables.paymentId) });
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

/**
 * Поллинг статуса платежа.
 * Опрашивает каждые 3 секунды, пока статус PENDING.
 */
export const usePaymentPolling = (paymentId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: paymentsKeys.detail(paymentId),
    queryFn: () => paymentsClient.getPaymentById(paymentId),
    enabled,
    refetchInterval: (query) => {
      if (query.state.data?.status !== 'PENDING') {
        return false;
      }
      return 3000;
    },
    staleTime: 0,
  });
};

/**
 * Обработка следующего действия платежа (redirect, openInvoice).
 */
export const usePaymentActions = () => {
  const handlePaymentAction = async (payment: Payment): Promise<void> => {
    if (!payment.nextAction) {
      return;
    }

    switch (payment.nextAction.type) {
      case 'openInvoice':
        console.warn('Not in Telegram environment, cannot open invoice');
        break;

      case 'redirect':
        if (typeof window !== 'undefined') {
          window.open(payment.nextAction.url, '_blank');
        }
        break;

      case 'none':
        break;
    }
  };

  return { handlePaymentAction };
};