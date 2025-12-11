import { Select } from '@/shared/ui';
import type { EventAdminFilters } from '@/shared/api';
import styles from './TemplatesFilters.module.scss';

interface TemplatesFiltersProps {
  filters: EventAdminFilters;
  onFilterChange: (filters: Partial<EventAdminFilters>) => void;
}

const statusOptions = [
  { value: '', label: <div className={styles.option}>Все статусы</div> },
  { value: 'ACTIVE', label: <div className={styles.option}>Активно</div> },
  { value: 'CANCELLED', label: <div className={styles.option}>Отменено</div> },
];

export function TemplatesFilters({ filters, onFilterChange }: TemplatesFiltersProps) {
  return (
    <div className={styles.filters}>
      <Select
        value={filters.status || ''}
        options={statusOptions}
        onChange={(value) =>
          onFilterChange({ status: (value || undefined) as EventAdminFilters['status'] })
        }
        placeholder="Статус"
      />
    </div>
  );
}
