import { useState, useEffect, useRef } from 'react';
import { Select, TextInput } from '@/shared/ui';
import type { CertificateAdminFilters } from '@/shared/api';
import { MagnifyingGlassRegular } from '@/shared/ds/icons';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';
import styles from './CertificatesFilters.module.scss';

interface CertificatesFiltersProps {
  filters: CertificateAdminFilters;
  onFilterChange: (filters: Partial<CertificateAdminFilters>) => void;
}

const typeOptions = [
  { value: '', label: <div className={styles.option}>Все типы</div> },
  { value: 'denomination', label: <div className={styles.option}>Номинал</div> },
  { value: 'passes', label: <div className={styles.option}>Разовый</div> },
];

const statusOptions = [
  { value: '', label: <div className={styles.option}>Все статусы</div> },
  { value: 'PENDING_ACTIVATION', label: <div className={styles.option}>Ожидает активации</div> },
  { value: 'ACTIVATED', label: <div className={styles.option}>Активирован</div> },
  { value: 'EXPIRED', label: <div className={styles.option}>Истёк</div> },
];

export function CertificatesFilters({ filters, onFilterChange }: CertificatesFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.clientSearch || '');
  const debouncedSearch = useDebounce(searchValue, 300);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!isInternalChange.current) {
      setSearchValue(filters.clientSearch || '');
    }
    isInternalChange.current = false;
  }, [filters.clientSearch]);

  useEffect(() => {
    if (debouncedSearch !== filters.clientSearch) {
      isInternalChange.current = true;
      onFilterChange({ clientSearch: debouncedSearch || undefined });
    }
  }, [debouncedSearch, filters.clientSearch, onFilterChange]);

  return (
    <div className={styles.filters}>
      <Select
        value={filters.type || ''}
        options={typeOptions}
        onChange={(value) =>
          onFilterChange({ type: (value || undefined) as CertificateAdminFilters['type'] })
        }
        placeholder="Тип"
      />

      <Select
        value={filters.status || ''}
        options={statusOptions}
        onChange={(value) =>
          onFilterChange({ status: (value || undefined) as CertificateAdminFilters['status'] })
        }
        placeholder="Статус"
      />

      <TextInput
        leftIcon={MagnifyingGlassRegular}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Поиск по клиенту"
      />
    </div>
  );
}
