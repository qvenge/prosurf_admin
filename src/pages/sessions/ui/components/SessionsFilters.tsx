import { Select, Icon } from '@/shared/ui';
import type { SessionAdminFilters, SessionStatus } from '@/shared/api';
import { XBold } from '@/shared/ds/icons';
import styles from './SessionsFilters.module.scss';

interface SessionsFiltersProps {
  filters: SessionAdminFilters;
  onFilterChange: (filters: Partial<SessionAdminFilters>) => void;
  eventName?: string | null;
  onClearEvent?: () => void;
}

const eventTypeOptions = [
  { value: '', label: <div className={styles.option}>Все типы</div> },
  { value: 'training:surfing', label: <div className={styles.option}>Серфинг</div> },
  { value: 'training:surfskate', label: <div className={styles.option}>Серфскейт</div> },
  { value: 'tour', label: <div className={styles.option}>Туры</div> },
  { value: 'activity', label: <div className={styles.option}>Ивенты</div> },
];

const statusOptions = [
  { value: '', label: <div className={styles.option}>Все статусы</div> },
  { value: 'SCHEDULED', label: <div className={styles.option}>Запланировано</div> },
  { value: 'CANCELLED', label: <div className={styles.option}>Отменено</div> },
  { value: 'COMPLETE', label: <div className={styles.option}>Завершено</div> },
];

export function SessionsFilters({
  filters,
  onFilterChange,
  eventName,
  onClearEvent,
}: SessionsFiltersProps) {
  const getEventTypeValue = () => {
    return filters.labels?.[0] || '';
  };

  const getStatusValue = () => {
    return filters.status || '';
  };

  return (
    <div className={styles.filters}>
      <Select
        value={getEventTypeValue()}
        options={eventTypeOptions}
        onChange={(value) =>
          onFilterChange({
            labels: value === '' ? undefined : [value],
          })
        }
        placeholder="Тип"
      />

      <Select
        value={getStatusValue()}
        options={statusOptions}
        onChange={(value) =>
          onFilterChange({
            status: value === '' ? undefined : (value as SessionStatus),
          })
        }
        placeholder="Статус"
      />

      {eventName && onClearEvent && (
        <div className={styles.filterBadge}>
          <span>Событие: {eventName}</span>
          <button onClick={onClearEvent} className={styles.filterBadgeClose}>
            <Icon src={XBold} width={14} height={14} />
          </button>
        </div>
      )}
    </div>
  );
}
