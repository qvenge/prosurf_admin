import { useState, useEffect, useRef } from 'react';
import { TextInput, Select } from '@/shared/ui';
import type { ClientAdminFilters } from '@/shared/api';
import { MagnifyingGlassRegular } from '@/shared/ds/icons';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';
import styles from './UsersFilters.module.scss';

interface UsersFiltersProps {
  filters: ClientAdminFilters;
  onFilterChange: (filters: Partial<ClientAdminFilters>) => void;
}

const statusOptions = [
  { value: 'active', label: 'Активные' },
  { value: 'deleted', label: 'Удаленные' },
];

export function UsersFilters({ filters, onFilterChange }: UsersFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchValue, 300);
  const isInternalChange = useRef(false);

  const statusValue = filters.isActive === false ? 'deleted' : 'active';

  useEffect(() => {
    if (!isInternalChange.current) {
      setSearchValue(filters.search || '');
    }
    isInternalChange.current = false;
  }, [filters.search]);

  useEffect(() => {
    // Normalize both values: empty string and undefined are treated as the same
    const normalizedDebounced = debouncedSearch || undefined;
    const normalizedFilter = filters.search || undefined;

    if (normalizedDebounced !== normalizedFilter) {
      isInternalChange.current = true;
      onFilterChange({ search: normalizedDebounced });
    }
  }, [debouncedSearch, filters.search, onFilterChange]);

  const handleStatusChange = (value: string) => {
    onFilterChange({ isActive: value === 'active' });
  };

  return (
    <div className={styles.filters}>
      <TextInput
        leftIcon={MagnifyingGlassRegular}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Поиск по имени, телефону или username"
      />
      <Select
        options={statusOptions}
        value={statusValue}
        onChange={handleStatusChange}
      />
    </div>
  );
}
