import { useState, useEffect, useRef } from 'react';
import { TextInput } from '@/shared/ui';
import type { ClientAdminFilters } from '@/shared/api';
import { MagnifyingGlassRegular } from '@/shared/ds/icons';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';
import styles from './UsersFilters.module.scss';

interface UsersFiltersProps {
  filters: ClientAdminFilters;
  onFilterChange: (filters: Partial<ClientAdminFilters>) => void;
}

export function UsersFilters({ filters, onFilterChange }: UsersFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchValue, 300);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!isInternalChange.current) {
      setSearchValue(filters.search || '');
    }
    isInternalChange.current = false;
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      isInternalChange.current = true;
      onFilterChange({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch, filters.search, onFilterChange]);

  return (
    <div className={styles.filters}>
      <TextInput
        leftIcon={MagnifyingGlassRegular}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Поиск по имени, телефону или username"
      />
    </div>
  );
}
