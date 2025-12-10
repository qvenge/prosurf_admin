import { useState, useEffect, useRef } from 'react';
import { Select, TextInput, Icon } from '@/shared/ui';
import type { SeasonTicketAdminFilters, SeasonTicketStatus } from '@/shared/api';
import { MagnifyingGlassRegular, XBold } from '@/shared/ds/icons';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';
import styles from './SeasonTicketsFilters.module.scss';

interface SeasonTicketsFiltersProps {
  filters: SeasonTicketAdminFilters;
  onFilterChange: (filters: Partial<SeasonTicketAdminFilters>) => void;
  planName?: string | null;
  onClearPlan?: () => void;
  clientName?: string | null;
  onClearClient?: () => void;
}

const statusOptions = [
  { value: '', label: <div className={styles.option}>Все статусы</div> },
  { value: 'ACTIVE', label: <div className={styles.option}>Активные</div> },
  { value: 'EXPIRED', label: <div className={styles.option}>Истёкшие</div> },
  { value: 'CANCELLED', label: <div className={styles.option}>Отменённые</div> },
];

const passesOptions = [
  { value: '', label: <div className={styles.option}>Все</div> },
  { value: 'true', label: <div className={styles.option}>С посещениями</div> },
  { value: 'false', label: <div className={styles.option}>Без посещений</div> },
];

export function SeasonTicketsFilters({
  filters,
  onFilterChange,
  planName,
  onClearPlan,
  clientName,
  onClearClient,
}: SeasonTicketsFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.ownerSearch || '');
  const debouncedSearch = useDebounce(searchValue, 300);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!isInternalChange.current) {
      setSearchValue(filters.ownerSearch || '');
    }
    isInternalChange.current = false;
  }, [filters.ownerSearch]);

  useEffect(() => {
    if (debouncedSearch !== filters.ownerSearch) {
      isInternalChange.current = true;
      onFilterChange({ ownerSearch: debouncedSearch || undefined });
    }
  }, [debouncedSearch, filters.ownerSearch, onFilterChange]);

  const getStatusValue = () => {
    return filters.status?.[0] || '';
  };

  const getPassesValue = () => {
    if (filters.hasRemainingPasses === true) return 'true';
    if (filters.hasRemainingPasses === false) return 'false';
    return '';
  };

  return (
    <div className={styles.filters}>
      <Select
        value={getStatusValue()}
        options={statusOptions}
        onChange={(value) =>
          onFilterChange({
            status: value === '' ? undefined : [value as SeasonTicketStatus],
          })
        }
        placeholder="Статус"
      />

      <Select
        value={getPassesValue()}
        options={passesOptions}
        onChange={(value) =>
          onFilterChange({
            hasRemainingPasses: value === '' ? undefined : value === 'true',
          })
        }
        placeholder="Посещения"
      />

      <TextInput
        leftIcon={MagnifyingGlassRegular}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Поиск по владельцу"
      />

      {planName && onClearPlan && (
        <div className={styles.filterBadge}>
          <span>План: {planName}</span>
          <button onClick={onClearPlan} className={styles.filterBadgeClose}>
            <Icon src={XBold} width={14} height={14} />
          </button>
        </div>
      )}

      {clientName && onClearClient && (
        <div className={styles.filterBadge}>
          <span>Клиент: {clientName}</span>
          <button onClick={onClearClient} className={styles.filterBadgeClose}>
            <Icon src={XBold} width={14} height={14} />
          </button>
        </div>
      )}
    </div>
  );
}
