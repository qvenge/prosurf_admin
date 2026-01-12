import axios, { 
  type AxiosInstance, 
  type AxiosRequestConfig, 
  type AxiosResponse, 
  type InternalAxiosRequestConfig,
  AxiosError 
} from 'axios';
import { ErrorSchema } from './schemas';
import type { ApiError, RefreshResponse } from './types';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'surf_access_token',
  REFRESH_TOKEN: 'surf_refresh_token',
  USER: 'surf_user',
} as const;

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
  
  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  
  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },
  
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};

export class ApiErrorClass extends Error {
  public error: ApiError;
  public status: number;
  public statusText: string;

  constructor(
    error: ApiError,
    status: number,
    statusText: string,
  ) {
    super(error.message);
    this.name = 'ApiError';
    this.error = error;
    this.status = status;
    this.statusText = statusText;
  }
}

export class ValidationError extends Error {
  public readonly isValidationError = true;

  constructor(message: string = 'Invalid response format') {
    super(message);
    this.name = 'ValidationError';
  }
}

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3000'),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Флаг для предотвращения бесконечного цикла при обновлении токена
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token!);
      }
    });
    
    failedQueue = [];
  };

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { 
        _retry?: boolean 
      };

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return client(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          processQueue(error, null);
          tokenStorage.clearTokens();
          isRefreshing = false;
          return Promise.reject(error);
        }

        try {
          const refreshResponse = await axios.post<RefreshResponse>(
            `${client.defaults.baseURL}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;
          
          tokenStorage.setAccessToken(accessToken);
          tokenStorage.setRefreshToken(newRefreshToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          processQueue(null, accessToken);
          
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          tokenStorage.clearTokens();
          // window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (error.response?.data) {
        try {
          const parsedError = ErrorSchema.parse(error.response.data);
          const apiError = new ApiErrorClass(
            parsedError,
            error.response.status,
            error.response.statusText
          );
          return Promise.reject(apiError);
        } catch {
          const genericError = new ApiErrorClass(
            {
              code: 'PROVIDER_UNAVAILABLE',
              message: error.message || 'An unexpected error occurred',
              details: null,
            },
            error.response.status,
            error.response.statusText
          );
          return Promise.reject(genericError);
        }
      }

      const networkError = new ApiErrorClass(
        {
          code: 'PROVIDER_UNAVAILABLE',
          message: error.message || 'Network error occurred',
          details: null,
        },
        0,
        'Network Error'
      );
      return Promise.reject(networkError);
    }
  );

  return client;
};

export const apiClient = createApiClient();

/**
 * Добавляет ключ идемпотентности к конфигу запроса
 */
export const withIdempotency = (
  config: AxiosRequestConfig,
  key: string
): AxiosRequestConfig => ({
  ...config,
  headers: {
    ...config.headers,
    'Idempotency-Key': key,
  },
});

/**
 * Создаёт query-строку из объекта фильтров
 */
export const createQueryString = (filters: Record<string, unknown>): string => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null && item !== '') {
            params.append(key, String(item));
          }
        });
      } else {
        params.append(key, String(value));
      }
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

/**
 * Валидирует данные ответа через Zod-схему.
 */
export const validateResponse = <T>(
  data: unknown,
  schema: { parse: (data: unknown) => T }
): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('Ошибка валидации ответа:', error);
    throw new ValidationError('Invalid response format');
  }
};

export const config = {
  apiUrl: import.meta.env.MODE === 'development' ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3000'),
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
} as const;