import { useEffect } from 'react';
import type { EventFormProps } from '../lib/types';
import { useEventFormState } from '../lib/hooks/useEventFormState';
import { useEventFormValidation } from '../lib/hooks/useEventFormValidation';
import { useEventFormApi } from '../lib/hooks/useEventFormApi';
import { useEventFormInitialization } from '../lib/hooks/useEventFormInitialization';
import { EventFormMainInfo } from './EventFormMainInfo';
import { EventFormSessions } from './EventFormSessions';
import { EventFormDescription } from './EventFormDescription';
import { EventFormActions } from './EventFormActions';
import styles from './EventForm.module.scss';

export function EventForm({ onClose, eventId, rangeMode = false }: EventFormProps) {
  const { isEditMode, existingSessions, isInitialLoading, initializeFormData } = useEventFormInitialization(eventId);

  const {
    formData,
    selectedSessionId,
    setSelectedSessionId,
    setFormData,
    handleInputChange,
    handleSessionChange,
    handleTimeSlotChange,
    addTimeSlot,
    removeTimeSlot,
    addSession,
    removeSession,
  } = useEventFormState();

  const { errors, clearError, validateForm } = useEventFormValidation();
  const { createEvent, updateEvent, isLoading } = useEventFormApi();

  useEffect(() => {
    const initialData = initializeFormData();
    if (initialData) {
      setFormData(initialData);
    }
  }, [initializeFormData, setFormData]);

  const handleInputChangeWithClearError = (field: keyof typeof formData, value: string) => {
    handleInputChange(field, value);
    clearError(field);
  };

  const handleSubmit = async () => {
    if (!validateForm(formData)) return;

    try {
      if (isEditMode) {
        await updateEvent(eventId!, formData, existingSessions);
      } else {
        await createEvent(formData);
      }
      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} event:`, error);
    }
  };

  if (isInitialLoading) {
    return (
      <div className={styles.root}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Загрузка данных события...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.form}>
        <EventFormMainInfo
          formData={formData}
          errors={errors}
          onInputChange={handleInputChangeWithClearError}
          onClearError={clearError}
        />

        <EventFormSessions
          sessions={formData.sessions}
          selectedSessionId={selectedSessionId}
          errors={errors}
          rangeMode={rangeMode}
          onSelectedSessionChange={setSelectedSessionId}
          onSessionChange={handleSessionChange}
          onTimeSlotChange={handleTimeSlotChange}
          onAddTimeSlot={addTimeSlot}
          onRemoveTimeSlot={removeTimeSlot}
          onAddSession={addSession}
          onRemoveSession={removeSession}
        />

        <EventFormDescription
          formData={formData}
          onInputChange={handleInputChangeWithClearError}
        />
      </div>

      <EventFormActions
        isEditMode={isEditMode}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}