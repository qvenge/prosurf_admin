import { useState, useMemo } from 'react';
import { Modal, Button, DataTable, IconButton, type ColumnDef, type SortCriterion } from '@/shared/ui';
import { PencilSimpleBold, TrashBold } from '@/shared/ds/icons';
import { formatDate, formatPrice } from '@/shared/lib/format-utils';
import { ClientCell } from './ClientCell';
import { useDeleteCertificateAdmin, type CertificateAdmin } from '@/shared/api';
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

const formatValue = (cert: CertificateAdmin) => {
  if ('amount' in cert.data) {
    return formatPrice(cert.data.amount);
  }
  return '—';
};

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

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const certificateToDelete = data.find((c) => c.id === deleteId);

  const columns: ColumnDef<CertificateAdmin>[] = useMemo(() => [
    {
      id: 'purchasedBy',
      label: 'Покупатель',
      sortable: true,
      sortKey: 'purchasedByName',
      render: (cert) => <ClientCell client={cert.purchasedBy} />,
    },
    {
      id: 'activatedBy',
      label: 'Активатор',
      sortable: true,
      sortKey: 'activatedByName',
      render: (cert) => <ClientCell client={cert.activatedBy} />,
    },
    {
      id: 'type',
      label: 'Тип',
      sortable: true,
      sortKey: 'type',
      render: (cert) => (
        <span className={`${styles.type} ${styles[`type${cert.type}`]}`}>
          {TYPE_LABELS[cert.type] || cert.type}
        </span>
      ),
    },
    {
      id: 'value',
      label: 'Стоимость',
      render: (cert) => formatValue(cert),
    },
    {
      id: 'createdAt',
      label: 'Дата покупки',
      sortable: true,
      sortKey: 'createdAt',
      render: (cert) => formatDate(cert.createdAt),
    },
    {
      id: 'activatedAt',
      label: 'Дата активации',
      sortable: true,
      sortKey: 'activatedAt',
      render: (cert) => (cert.activatedAt ? formatDate(cert.activatedAt) : '—'),
    },
    {
      id: 'expiresAt',
      label: 'Срок действия',
      sortable: true,
      sortKey: 'expiresAt',
      render: (cert) => (
        <span className={`${styles.status} ${styles[`status${cert.status}`]}`}>
          {cert.expiresAt ? formatDate(cert.expiresAt) : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
      width: '100px',
      render: (cert) => (
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
      ),
    },
  ], [onEdit]);

  return (
    <>
      <DataTable
        className={className}
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Нет сертификатов"
        getRowKey={(cert) => cert.id}
        sort={sort}
        onSortChange={onSortChange}
      />

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
    </>
  );
}
