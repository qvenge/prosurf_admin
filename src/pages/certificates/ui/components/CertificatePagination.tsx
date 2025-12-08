import { Button } from '@/shared/ui';
import styles from './CertificatePagination.module.scss';

interface CertificatePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function CertificatePagination({
  page,
  totalPages,
  total,
  onPageChange,
}: CertificatePaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Show first, last, current and neighbors
      pages.push(1);

      if (page > 3) pages.push('ellipsis');

      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push('ellipsis');

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className={styles.pagination}>
        <span className={styles.info}>Всего: {total}</span>
      </div>
    );
  }

  return (
    <div className={styles.pagination}>
      <span className={styles.info}>Всего: {total}</span>

      <div className={styles.controls}>
        <Button
          type="secondary"
          size="s"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Назад
        </Button>

        <div className={styles.pages}>
          {getPageNumbers().map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
                ...
              </span>
            ) : (
              <button
                key={p}
                className={`${styles.pageButton} ${p === page ? styles.active : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
          )}
        </div>

        <Button
          type="secondary"
          size="s"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Вперед
        </Button>
      </div>
    </div>
  );
}
