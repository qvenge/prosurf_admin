import { type ReactNode } from 'react';
import { Icon } from '@/shared/ui';
import { ArrowUpBold, ArrowDownBold } from '@/shared/ds/icons';
import styles from './DataTable.module.scss';

export interface SortCriterion {
  field: string;
  order: 'asc' | 'desc';
}

export interface ColumnDef<T> {
  id: string;
  label: string;
  render: (item: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortKey?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  className?: string;
  getRowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  sort?: SortCriterion[];
  onSortChange?: (sort: SortCriterion[]) => void;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'Нет данных',
  loadingMessage = 'Загрузка...',
  className,
  getRowKey,
  onRowClick,
  sort = [],
  onSortChange,
}: DataTableProps<T>) {
  const getSortDirection = (field: string): 'asc' | 'desc' | null => {
    const criterion = sort.find((s) => s.field === field);
    return criterion?.order || null;
  };

  const isColumnSorted = (field: string): boolean => {
    return sort.some((s) => s.field === field);
  };

  const getSortIndex = (field: string): number | null => {
    const index = sort.findIndex((s) => s.field === field);
    return index >= 0 ? index + 1 : null;
  };

  const handleSort = (field: string) => {
    if (!onSortChange) return;

    const existingIndex = sort.findIndex((s) => s.field === field);

    if (existingIndex === -1) {
      onSortChange([...sort, { field, order: 'asc' }]);
    } else {
      const existing = sort[existingIndex];
      if (existing.order === 'asc') {
        const newSort = [...sort];
        newSort[existingIndex] = { field, order: 'desc' };
        onSortChange(newSort);
      } else {
        onSortChange(sort.filter((s) => s.field !== field));
      }
    }
  };

  return (
    <div className={`${styles.tableContainer} ${className || ''}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => {
              const sortKey = col.sortKey || col.id;
              const isSortable = col.sortable && onSortChange;

              return (
                <th
                  key={col.id}
                  className={`${styles.th} ${isSortable ? styles.sortable : ''}`}
                  style={{
                    width: col.width,
                    textAlign: col.align || 'left',
                  }}
                  onClick={isSortable ? () => handleSort(sortKey) : undefined}
                >
                  <span className={styles.thContent}>
                    {col.label}
                    {isSortable && (
                      <>
                        <Icon
                          src={getSortDirection(sortKey) === 'asc' ? ArrowUpBold : ArrowDownBold}
                          className={`${styles.sortIcon} ${!isColumnSorted(sortKey) ? styles.sortIconInactive : ''}`}
                        />
                        {sort.length > 1 && isColumnSorted(sortKey) && (
                          <span className={styles.sortOrder}>{getSortIndex(sortKey)}</span>
                        )}
                      </>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className={styles.loading}>
                {loadingMessage}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={getRowKey(item)}
                className={`${styles.row} ${onRowClick ? styles.clickable : ''}`}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={styles.td}
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
