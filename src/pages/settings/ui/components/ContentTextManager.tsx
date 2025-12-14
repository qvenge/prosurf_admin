import { useState } from 'react';
import { Skeleton, SideModal, Textarea, Button } from '@/shared/ui';
import { useContents, useUpdateContent } from '@/shared/api';
import type { Content } from '@/shared/api';
import styles from './ContentTextManager.module.scss';

export interface ContentTextManagerProps {
  title: string;
  keyPrefix: string;
}

export function ContentTextManager({ title, keyPrefix }: ContentTextManagerProps) {
  const { data, isLoading } = useContents({ keyPrefix });
  const updateMutation = useUpdateContent();

  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [editValue, setEditValue] = useState('');

  const contents = data?.items ?? [];

  const handleCardClick = (content: Content) => {
    setEditingContent(content);
    setEditValue(content.content);
  };

  const handleSave = () => {
    if (!editingContent) return;

    updateMutation.mutate(
      { id: editingContent.id, data: { content: editValue } },
      {
        onSuccess: () => {
          setEditingContent(null);
          setEditValue('');
        },
      }
    );
  };

  const handleClose = () => {
    setEditingContent(null);
    setEditValue('');
  };

  const isSaving = updateMutation.isPending;

  // Truncate content for preview
  const truncate = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className={styles.root}>
      <h4 className={styles.title}>{title}</h4>
      <div className={styles.cards}>
        {isLoading ? (
          <>
            <Skeleton className={styles.skeletonCard} />
            <Skeleton className={styles.skeletonCard} />
          </>
        ) : contents.length === 0 ? (
          <p className={styles.empty}>Нет контента с префиксом "{keyPrefix}"</p>
        ) : (
          contents.map((content) => (
            <button
              key={content.id}
              type="button"
              className={styles.card}
              onClick={() => handleCardClick(content)}
            >
              <div className={styles.cardTitle}>{content.title}</div>
              <div className={styles.cardPreview}>
                {truncate(content.content) || 'Пустой контент'}
              </div>
            </button>
          ))
        )}
      </div>

      {editingContent && (
        <SideModal onClose={handleClose}>
          <div className={styles.sideModalContent}>
            <h3 className={styles.sideModalTitle}>{editingContent.title}</h3>
            <p className={styles.sideModalKey}>Ключ: {editingContent.key}</p>
            <Textarea
              className={styles.textarea}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Введите текст (поддерживается markdown)"
              disabled={isSaving}
            />
            <div className={styles.sideModalActions}>
              <Button
                type="primary"
                size="l"
                streched
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaving}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </SideModal>
      )}
    </div>
  );
}
