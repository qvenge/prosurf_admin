/**
 * Интервалы автоматического обновления данных (refetchInterval).
 * Используются с TanStack Query для фонового polling актуальных данных.
 *
 * Важно: refetchIntervalInBackground: false используется вместе с этими интервалами,
 * чтобы не тратить ресурсы на неактивных вкладках.
 */
export const REFRESH_INTERVALS = {
  /** Сессии - критично для управления местами */
  SESSIONS: 15 * 1000, // 15 сек

  /** Бронирования - админ должен видеть новые брони быстро */
  BOOKINGS: 15 * 1000, // 15 сек

  /** Admin views - частое обновление для оперативного мониторинга */
  ADMIN_VIEWS: 15 * 1000, // 15 сек

  /** Стабильные данные - без автоматического polling */
  ADMIN_PROFILE: false as const,
  EVENT_DETAIL: false as const,
} as const;
