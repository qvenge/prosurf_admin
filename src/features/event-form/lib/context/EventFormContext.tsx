import { createContext, useEffect, type ReactNode } from 'react';
import type { FormData, ValidationErrors, Category, SessionForm, TimeSlot } from '../types';
import { useEventFormState } from '../hooks/useEventFormState';
import { useEventFormValidation } from '../hooks/useEventFormValidation';
import { useEventFormApi } from '../hooks/useEventFormApi';
import { useEventFormInitialization } from '../hooks/useEventFormInitialization';

interface EventFormContextValue {
  // Form state
  formData: FormData;
  selectedSessionId: string;
  setSelectedSessionId: (sessionId: string) => void;
  setFormData: (data: FormData) => void;

  // Form handlers
  handleInputChange: (field: keyof FormData, value: string) => void;
  handleSessionChange: (sessionId: string, field: keyof Omit<SessionForm, 'timeSlots'>, value: string | number) => void;
  handleTimeSlotChange: (sessionId: string, timeSlotId: string, field: keyof TimeSlot, value: string) => void;
  addTimeSlot: (sessionId: string) => void;
  removeTimeSlot: (sessionId: string, timeSlotId: string) => void;
  addSession: () => void;
  removeSession: (sessionId: string) => void;

  // Validation
  errors: ValidationErrors;
  clearError: (field: string) => void;
  validateForm: (data: FormData) => boolean;

  // API
  createEvent: (data: FormData) => Promise<void>;
  updateEvent: (eventId: string, data: FormData, existingSessions: string[]) => Promise<void>;
  isLoading: boolean;

  // Initialization
  isEditMode: boolean;
  existingSessions: string[];
  isInitialLoading: boolean;

  // Configuration
  rangeMode: boolean;
  categories?: Category[];

  // Actions
  handleSubmit: () => Promise<void>;
  onClose: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const EventFormContext = createContext<EventFormContextValue | undefined>(undefined);

interface EventFormProviderProps {
  children: ReactNode;
  onClose: () => void;
  eventId?: string;
  rangeMode?: boolean;
  categories?: Category[];
}

export function EventFormProvider({
  children,
  onClose,
  eventId,
  rangeMode = false,
  categories
}: EventFormProviderProps) {
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

  const handleInputChangeWithClearError = (field: keyof FormData, value: string) => {
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

  const contextValue: EventFormContextValue = {
    // Form state
    formData,
    selectedSessionId,
    setSelectedSessionId,
    setFormData,

    // Form handlers
    handleInputChange: handleInputChangeWithClearError,
    handleSessionChange,
    handleTimeSlotChange,
    addTimeSlot,
    removeTimeSlot,
    addSession,
    removeSession,

    // Validation
    errors,
    clearError,
    validateForm,

    // API
    createEvent,
    updateEvent,
    isLoading,

    // Initialization
    isEditMode,
    existingSessions,
    isInitialLoading,

    // Configuration
    rangeMode,
    categories,

    // Actions
    handleSubmit,
    onClose
  };

  return (
    <EventFormContext.Provider value={contextValue}>
      {children}
    </EventFormContext.Provider>
  );
}

