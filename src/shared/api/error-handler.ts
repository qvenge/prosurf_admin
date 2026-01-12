import { ApiErrorClass, ValidationError } from './config';
import type { ApiError } from './types';

export const isApiError = (error: unknown): error is ApiErrorClass => {
  return error instanceof ApiErrorClass;
};

export const isAuthError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 401;
};

export const isForbiddenError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 403;
};

export const isNotFoundError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 404;
};

export const isConflictError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 409;
};

export const isValidationError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 422;
};

export const isNetworkError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 0;
};

export const isServerError = (error: unknown): boolean => {
  return isApiError(error) && error.status >= 500;
};

export const isValidationResponseError = (error: unknown): boolean => {
  return error instanceof ValidationError;
};

export const isHoldExpiredError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'HOLD_EXPIRED';
};

export const isNoSeatsError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'NO_SEATS';
};

export const isAmountMismatchError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'AMOUNT_MISMATCH';
};

export const isDuplicatePaymentError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'DUPLICATE_PAYMENT';
};

export const isProviderUnavailableError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'PROVIDER_UNAVAILABLE';
};

export const isInvalidCredentialsError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'INVALID_CREDENTIALS';
};

export const isUserExistsError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'USER_EXISTS';
};

export const isWeakPasswordError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'WEAK_PASSWORD';
};

export const isInvalidEmailError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'INVALID_EMAIL';
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const getErrorCode = (error: unknown): string | null => {
  if (isApiError(error)) {
    return error.error.code;
  }
  
  return null;
};

export const getErrorDetails = (error: unknown): unknown => {
  if (isApiError(error)) {
    return error.error.details;
  }
  
  return null;
};

const ERROR_MESSAGES: Record<ApiError['code'], string> = {
  HOLD_EXPIRED: 'Время бронирования истекло. Пожалуйста, забронируйте снова.',
  NO_SEATS: 'К сожалению, места закончились.',
  AMOUNT_MISMATCH: 'Сумма платежа не совпадает. Попробуйте снова.',
  DUPLICATE_PAYMENT: 'Этот платеж уже был обработан.',
  PROVIDER_UNAVAILABLE: 'Сервис временно недоступен. Попробуйте позже.',
  INVALID_CREDENTIALS: 'Неверные учетные данные. Проверьте email/username и пароль.',
  USER_EXISTS: 'Пользователь с таким email или username уже существует.',
  WEAK_PASSWORD: 'Пароль должен содержать минимум 6 символов.',
  INVALID_EMAIL: 'Некорректный формат email.',
  HAS_ACTIVE_BOOKINGS: 'Невозможно выполнить операцию: существуют активные бронирования.',
  HAS_ACTIVE_SESSIONS: 'Невозможно выполнить операцию: существуют активные сессии.',
};

export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    const friendlyMessage = ERROR_MESSAGES[error.error.code];
    if (friendlyMessage) {
      return friendlyMessage;
    }
    return error.error.message;
  }
  
  if (isNetworkError(error)) {
    return 'Проблемы с подключением к интернету. Проверьте соединение и попробуйте снова.';
  }
  
  if (isServerError(error)) {
    return 'Сервис временно недоступен. Попробуйте позже.';
  }
  
  return getErrorMessage(error);
};

export const logError = (error: unknown, context?: string): void => {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  const details = getErrorDetails(error);
  
  console.error('API Error:', {
    message,
    code,
    details,
    context,
    timestamp: new Date().toISOString(),
    ...(isApiError(error) && {
      status: error.status,
      statusText: error.statusText,
    }),
  });
};

/**
 * Определяет, стоит ли повторять запрос при ошибке.
 * Ошибки валидации не повторяем - это несоответствие схемы.
 */
export const shouldRetry = (error: unknown): boolean => {
  if (isValidationResponseError(error)) {
    return false;
  }

  if (isApiError(error)) {
    return isServerError(error) || isProviderUnavailableError(error);
  }

  return isNetworkError(error);
};

/**
 * Вычисляет задержку перед повторным запросом.
 * Использует экспоненциальный backoff: 1с, 2с, 4с, 8с, 16с (макс).
 */
export const getRetryDelay = (attemptNumber: number): number => {
  return Math.min(1000 * Math.pow(2, attemptNumber), 16000);
};

export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  canRetry: boolean;
  shouldShowToUser: boolean;
}

export const getErrorInfo = (error: unknown): ErrorInfo => {
  if (isApiError(error)) {
    return {
      message: getUserFriendlyErrorMessage(error),
      code: error.error.code,
      status: error.status,
      canRetry: shouldRetry(error),
      shouldShowToUser: !isAuthError(error), // Ошибки авторизации не показываем пользователю
    };
  }

  if (isValidationResponseError(error)) {
    return {
      message: 'Данные не соответствуют ожидаемому формату',
      canRetry: false,
      shouldShowToUser: true,
    };
  }

  return {
    message: getUserFriendlyErrorMessage(error),
    canRetry: shouldRetry(error),
    shouldShowToUser: true,
  };
};

export const createErrorBoundaryProps = (error: unknown) => ({
  error: getErrorInfo(error),
  onRetry: shouldRetry(error) ? () => window.location.reload() : undefined,
  showContactSupport: isServerError(error),
});

/**
 * Хук для обработки ошибок в компонентах.
 */
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string) => {
    logError(error, context);

    const errorInfo = getErrorInfo(error);

    if (isAuthError(error)) {
      return;
    }

    if (errorInfo.shouldShowToUser) {
      console.warn('Error to show to user:', errorInfo.message);
    }

    return errorInfo;
  };
  
  return {
    handleError,
    isApiError,
    isAuthError,
    isForbiddenError,
    isNotFoundError,
    isConflictError,
    isValidationError,
    isValidationResponseError,
    isNetworkError,
    isServerError,
    isHoldExpiredError,
    isNoSeatsError,
    isAmountMismatchError,
    isDuplicatePaymentError,
    isProviderUnavailableError,
    isInvalidCredentialsError,
    isUserExistsError,
    isWeakPasswordError,
    isInvalidEmailError,
    getErrorMessage,
    getUserFriendlyErrorMessage,
    shouldRetry,
  };
};