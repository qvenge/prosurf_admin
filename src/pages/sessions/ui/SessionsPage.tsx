import { Header, Button, Icon, SideModal, AlternativeTabs, SegmentedButtons } from '@/shared/ui';
import { SessionsTable } from './components/SessionsTable';
import { SessionsCalendar } from './components/SessionsCalendar';
import { SessionForm } from './components/SessionForm';
import { SessionDetails } from './components/SessionDetails';
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

const views = [
  { value: 'calendar', label: 'Календарь' },
  { value: 'list', label: 'Список' }
];

export function SessionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const sessionId = searchParams.get('sessionId');

  const [selectedView, setSelectedView] = useState(views[0].value);
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

  const handleCloseSession = () => {
    searchParams.delete('sessionId');
    setSearchParams(searchParams);
  };

  return (
    <>
      <Header title={'Записи'}>
        <SegmentedButtons
          options={views}
          value={selectedView}
          onChange={(value) => {
            setSelectedView(value);
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
          <AlternativeTabs
            items={eventTypeOptions}
            value={selectedEventType}
            onChange={setSelectedEventType}
          />
          {eventId && (
            <div className={styles.filterBadge}>
              <span>Событие: {event?.title ?? 'Загрузка...'}</span>
              <button onClick={clearEventIdFilter} className={styles.filterBadgeClose}>
                <Icon src={XBold} width={14} height={14} />
              </button>
            </div>
          )}
        </div>
        {selectedView === 'calendar' ? (
          <SessionsCalendar
            eventType={selectedEventType}
            eventId={eventId}
            className={styles.table}
          />
        ) : (
          <SessionsTable eventType={selectedEventType} eventId={eventId} className={styles.table} />
        )}
      </div>
      {isModalOpen && (
        <SideModal onClose={handleClose}>
          <SessionForm onClose={handleClose} />
        </SideModal>
      )}
      {sessionId && (
        <SideModal onClose={handleCloseSession}>
          <SessionDetails sessionId={sessionId} />
        </SideModal>
      )}
    </>
  );
}