import { useState } from 'react';
import { Skeleton, SideModal, Textarea, Button, Icon, ImageGalleryGrid } from '@/shared/ui';
import { CameraRegular } from '@/shared/ds/icons';
import {
  useNotificationTemplates,
  useUpdateNotificationTemplate,
  useUploadImages,
} from '@/shared/api';
import type { NotificationTemplate, NotificationTemplateType } from '@/shared/api';
import styles from './NotificationsTab.module.scss';

// Human-readable labels for template types
const TEMPLATE_LABELS: Record<NotificationTemplateType, string> = {
  BOOKING_CONFIRMATION: 'Подтверждение записи',
  SESSION_REMINDER_24H: 'Напоминание за 24 часа',
  CERTIFICATE_DENOMINATION: 'Сертификат (номинал)',
  CERTIFICATE_PASSES: 'Сертификат (занятие)',
};

// Descriptions for each template type
const TEMPLATE_DESCRIPTIONS: Record<NotificationTemplateType, string> = {
  BOOKING_CONFIRMATION: 'Отправляется клиенту сразу после успешной записи на сеанс',
  SESSION_REMINDER_24H: 'Отправляется клиенту за 24 часа до начала сеанса',
  CERTIFICATE_DENOMINATION: 'Отправляется после покупки сертификата на сумму',
  CERTIFICATE_PASSES: 'Отправляется после покупки сертификата на разовое занятие',
};

export function NotificationsTab() {
  const { data, isLoading } = useNotificationTemplates();
  const updateMutation = useUpdateNotificationTemplate();
  const uploadMutation = useUploadImages();

  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [editText, setEditText] = useState('');
  const [newImage, setNewImage] = useState<{ file: File; preview: string } | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const templates = data ?? [];

  const handleCardClick = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setEditText(template.text);
    setNewImage(null);
    setRemoveImage(false);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    let imageId: string | null | undefined = undefined;

    // Upload new image if selected
    if (newImage) {
      try {
        const uploaded = await uploadMutation.mutateAsync({
          files: [newImage.file],
          tags: ['notification-template'],
        });
        imageId = uploaded[0].id;
      } catch (error) {
        console.error('Failed to upload image:', error);
        return;
      }
    } else if (removeImage) {
      imageId = null;
    }

    updateMutation.mutate(
      {
        type: editingTemplate.type,
        data: {
          text: editText,
          ...(imageId !== undefined && { imageId }),
        },
      },
      {
        onSuccess: () => {
          setEditingTemplate(null);
          setEditText('');
          setNewImage(null);
          setRemoveImage(false);
        },
      },
    );
  };

  const handleClose = () => {
    setEditingTemplate(null);
    setEditText('');
    setNewImage(null);
    setRemoveImage(false);
  };

  const handleImageUpload = (data: { file: File; preview: string }[] | { file: File; preview: string } | null) => {
    if (!data) {
      setNewImage(null);
      return;
    }
    const singleData = Array.isArray(data) ? data[0] : data;
    setNewImage(singleData);
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setRemoveImage(true);
    setNewImage(null);
  };

  const insertVariable = (variable: string) => {
    const placeholder = `{${variable}}`;
    setEditText((prev) => prev + placeholder);
  };

  const isSaving = updateMutation.isPending || uploadMutation.isPending;

  // Truncate text for preview
  const truncate = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>Шаблоны уведомлений</h3>
        <p className={styles.description}>
          Настройте текст и изображения для уведомлений, отправляемых клиентам через Telegram.
          Используйте переменные в фигурных скобках для подстановки данных.
        </p>
      </div>

      <div className={styles.cards}>
        {isLoading ? (
          <>
            <Skeleton className={styles.skeletonCard} />
            <Skeleton className={styles.skeletonCard} />
            <Skeleton className={styles.skeletonCard} />
            <Skeleton className={styles.skeletonCard} />
          </>
        ) : templates.length === 0 ? (
          <p className={styles.empty}>Шаблоны уведомлений не найдены</p>
        ) : (
          templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={styles.card}
              onClick={() => handleCardClick(template)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  {TEMPLATE_LABELS[template.type]}
                </div>
                {template.imageUrl && (
                  <Icon src={CameraRegular} width={16} height={16} className={styles.cardImageIcon} />
                )}
              </div>
              <div className={styles.cardDescription}>
                {TEMPLATE_DESCRIPTIONS[template.type]}
              </div>
              <div className={styles.cardPreview}>
                {truncate(template.text) || 'Пустой шаблон'}
              </div>
            </button>
          ))
        )}
      </div>

      {editingTemplate && (
        <SideModal onClose={handleClose}>
          <div className={styles.sideModalContent}>
            <h3 className={styles.sideModalTitle}>
              {TEMPLATE_LABELS[editingTemplate.type]}
            </h3>
            <p className={styles.sideModalDescription}>
              {TEMPLATE_DESCRIPTIONS[editingTemplate.type]}
            </p>


            {/* Image section */}
            <div className={styles.imageSection}>
              <p className={styles.sectionLabel}>Изображение (опционально):</p>
              <ImageGalleryGrid
                images={(() => {
                  if (newImage) {
                    return [{ id: 'new', url: newImage.preview, alt: 'Новое изображение' }];
                  }
                  if (editingTemplate.imageUrl && !removeImage) {
                    return [{ id: 'existing', url: editingTemplate.imageUrl, alt: 'Текущее изображение' }];
                  }
                  return [];
                })()}
                onRemove={(id) => {
                  if (id === 'new') {
                    setNewImage(null);
                  } else {
                    handleRemoveImage();
                  }
                }}
                onUpload={handleImageUpload}
                maxImages={1}
                multiple={false}
                uploadLabel="Добавить"
              />
            </div>

            {/* Available variables */}
            <div className={styles.variablesSection}>
              <p className={styles.variablesTitle}>Доступные переменные:</p>
              <div className={styles.variablesList}>
                {editingTemplate.availableVariables.map((variable) => (
                  <button
                    key={variable}
                    type="button"
                    className={styles.variableChip}
                    onClick={() => insertVariable(variable)}
                    title={`Нажмите, чтобы вставить {${variable}}`}
                  >
                    {`{${variable}}`}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Text editor */}
            <div className={styles.textSection}>
              <Textarea
                className={styles.textarea}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Введите текст уведомления (поддерживается Telegram Markdown)"
                disabled={isSaving}
              />
            </div>

            {/* Actions */}
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
