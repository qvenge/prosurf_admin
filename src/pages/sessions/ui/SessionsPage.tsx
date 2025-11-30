import { Header, Button, Icon, SideModal, SegmentedButtons } from '@/shared/ui';
import { SessionsTable } from './components/SessionsTable';
import { SessionForm } from './components/SessionForm';
import { PlusBold, XBold } from '@/shared/ds/icons';
import styles from './SessionsPage.module.scss';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useEvent } from '@/shared/api';

const eventTypeOptions = [
  { value: '', label: 'Все' },
  { value: 'training:surfing', label: 'Серфинг' },
  { value: 'training:surfskate', label: 'Серфскейт' },
  { value: 'tour', label: 'Туры' },
  { value: 'activity', label: 'Ивенты' },
];

export function SessionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [selectedEventType, setSelectedEventType] = useState(eventTypeOptions[0].value);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Получить данные события для бейджа
  const { data: event } = useEvent(eventId ?? undefined, !!eventId);

  // При наличии eventId - форсировать таб "Все"
  useEffect(() => {
    if (eventId && selectedEventType !== '') {
      setSelectedEventType('');
    }
  }, [eventId, selectedEventType]);

  // Функция для сброса фильтра eventId
  const clearEventIdFilter = () => {
    searchParams.delete('eventId');
    setSearchParams(searchParams);
  };

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Header title={'Записи'}>
        <SegmentedButtons
          options={eventTypeOptions}
          value={selectedEventType}
          onChange={(value) => {
            setSelectedEventType(value);
          }}
        />
        <Button
          type="primary"
          size="l"
          onClick={handleCreate}
        >
          <Icon
            src={PlusBold}
            width={20}
            height={20}
          />
          Добавить
        </Button>
      </Header>
      <div className={styles.page}>
        <div className={styles.filters}>
          {eventId && (
            <div className={styles.filterBadge}>
              <span>Событие: {event?.title ?? 'Загрузка...'}</span>
              <button onClick={clearEventIdFilter} className={styles.filterBadgeClose}>
                <Icon src={XBold} width={14} height={14} />
              </button>
            </div>
          )}
        </div>
        <SessionsTable eventType={selectedEventType} eventId={eventId} className={styles.table} />
      </div>
      {isModalOpen && (
        <SideModal onClose={handleClose}>
          <SessionForm onClose={handleClose} />
        </SideModal>
      )}
    </>
  );
}