import { useState } from 'react';
import { Icon, Modal, Button } from '@/shared/ui';
import { IconButton } from '@/shared/ui';
import { PencilSimpleBold, TrashBold, ArrowUpBold, ArrowDownBold } from '@/shared/ds/icons';
import { formatDate, formatPrice } from '@/shared/lib/format-utils';
import { ClientCell } from './ClientCell';
import {
  useDeleteCertificateAdmin,
  type CertificateAdmin,
  type SortCriterion,
  type CertificateSortField,
} from '@/shared/api';
import styles from './CertificatesTable.module.scss';

interface CertificatesTableProps {
  className?: string;
  data: CertificateAdmin[];
  isLoading: boolean;
  sort: SortCriterion[];
  onSortChange: (sort: SortCriterion[]) => void;
  onEdit: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  denomination: 'Номинал',
  passes: 'Разовый',
};

const COLUMNS: Array<{
  id: string;
  label: string;
  sortable: boolean;
  sortKey?: CertificateSortField;
}> = [
  { id: 'purchasedBy', label: 'Покупатель', sortable: true, sortKey: 'purchasedByName' },
  { id: 'activatedBy', label: 'Активатор', sortable: true, sortKey: 'activatedByName' },
  { id: 'type', label: 'Тип', sortable: true, sortKey: 'type' },
  { id: 'value', label: 'Стоимость', sortable: false },
  { id: 'createdAt', label: 'Дата покупки', sortable: true, sortKey: 'createdAt' },
  { id: 'activatedAt', label: 'Дата активации', sortable: true, sortKey: 'activatedAt' },
  { id: 'expiresAt', label: 'Срок действия', sortable: true, sortKey: 'expiresAt' },
  { id: 'actions', label: '', sortable: false },
];

export function CertificatesTable({
  className,
  data,
  isLoading,
  sort,
  onSortChange,
  onEdit,
}: CertificatesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteCertificateAdmin();

  // Get sort direction for a field
  const getSortDirection = (field: CertificateSortField): 'asc' | 'desc' | null => {
    const criterion = sort.find((s) => s.field === field);
    return criterion?.order || null;
  };

  // Check if a column is sorted
  const isColumnSorted = (field: CertificateSortField): boolean => {
    return sort.some((s) => s.field === field);
  };

  // Get sort index (1-based) for a field when multi-sorting
  const getSortIndex = (field: CertificateSortField): number | null => {
    const index = sort.findIndex((s) => s.field === field);
    return index >= 0 ? index + 1 : null;
  };

  // Handle sort click with three-state cycle: none → asc → desc → none
  const handleSort = (field: CertificateSortField) => {
    const existingIndex = sort.findIndex((s) => s.field === field);

    if (existingIndex === -1) {
      // No sorting for this field → add asc
      onSortChange([...sort, { field, order: 'asc' }]);
    } else {
      const existing = sort[existingIndex];
      if (existing.order === 'asc') {
        // asc → desc
        const newSort = [...sort];
        newSort[existingIndex] = { field, order: 'desc' };
        onSortChange(newSort);
      } else {
        // desc → remove from array (sorting disabled)
        onSortChange(sort.filter((s) => s.field !== field));
      }
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const certificateToDelete = data.find((c) => c.id === deleteId);

  const formatValue = (cert: CertificateAdmin) => {
    if ('amount' in cert.data) {
      return formatPrice(cert.data.amount);
    }
    return `-`;
  };

  return (
    <div className={`${styles.tableContainer} ${className || ''}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.id}
                className={`${styles.th} ${col.sortable ? styles.sortable : ''}`}
                onClick={col.sortable && col.sortKey ? () => handleSort(col.sortKey!) : undefined}
              >
                <span className={styles.thContent}>
                  {col.label}
                  {col.sortable && col.sortKey && (
                    <>
                      <Icon
                        src={getSortDirection(col.sortKey) === 'asc' ? ArrowUpBold : ArrowDownBold}
                        className={`${styles.sortIcon} ${!isColumnSorted(col.sortKey) ? styles.sortIconInactive : ''}`}
                      />
                      {sort.length > 1 && isColumnSorted(col.sortKey) && (
                        <span className={styles.sortOrder}>{getSortIndex(col.sortKey)}</span>
                      )}
                    </>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={COLUMNS.length} className={styles.loading}>
                Загрузка...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className={styles.empty}>
                Нет сертификатов
              </td>
            </tr>
          ) : (
            data.map((cert) => (
              <tr key={cert.id} className={styles.row}>
                <td className={styles.td}>
                  <ClientCell client={cert.purchasedBy} />
                </td>
                <td className={styles.td}>
                  <ClientCell client={cert.activatedBy} />
                </td>
                <td className={styles.td}>
                  <span className={`${styles.type} ${styles[`type${cert.type}`]}`}>
                    {TYPE_LABELS[cert.type] || cert.type}
                  </span>
                </td>
                <td className={styles.td}>{formatValue(cert)}</td>
                <td className={styles.td}>{formatDate(cert.createdAt)}</td>
                <td className={styles.td}>
                  {cert.activatedAt ? formatDate(cert.activatedAt) : '—'}
                </td>
                <td className={styles.td}>
                  <span className={`${styles.status} ${styles[`status${cert.status}`]}`}>
                    {cert.expiresAt ? formatDate(cert.expiresAt) : '—'}
                  </span>
                </td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    <IconButton
                      src={PencilSimpleBold}
                      type="secondary"
                      size="s"
                      onClick={() => onEdit(cert.id)}
                    />
                    <IconButton
                      src={TrashBold}
                      type="secondary"
                      size="s"
                      onClick={() => setDeleteId(cert.id)}
                      disabled={cert.status === 'ACTIVATED'}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {deleteId && certificateToDelete && (
        <Modal onClose={() => setDeleteId(null)}>
          <div className={styles.deleteModal}>
            <h3>Удалить сертификат?</h3>
            <p>
              Код: <strong>{certificateToDelete.code}</strong>
            </p>
            <p>Это действие нельзя отменить.</p>
            <div className={styles.deleteModalActions}>
              <Button type="secondary" size="m" onClick={() => setDeleteId(null)}>
                Отмена
              </Button>
              <Button
                type="primary"
                size="m"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
