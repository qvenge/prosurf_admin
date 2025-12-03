import { createContext, useEffect, type ReactNode } from 'react';
import type { FormData, ValidationErrors, Category } from '../types';
import { useEventFormState } from '../hooks/useEventFormState';
import { useEventFormValidation } from '../hooks/useEventFormValidation';
import { useEventFormApi } from '../hooks/useEventFormApi';
import { useEventFormInitialization } from '../hooks/useEventFormInitialization';
import { defaultFormData } from '../constants';

interface EventFormContextValue {
  // Form state
  formData: FormData;
  setFormData: (data: FormData) => void;

  // Form handlers
  handleInputChange: (field: keyof FormData, value: string | File[]) => void;
  handleImageAdd: (files: File[]) => void;
  handleImageRemove: (index: number) => void;
  handleExistingImageRemove: (index: number) => void;

  // Validation
  errors: ValidationErrors;
  clearError: (field: string) => void;
  validateForm: (data: FormData) => boolean;

  // API
  createEvent: (data: FormData) => Promise<void>;
  updateEvent: (eventId: string, data: FormData) => Promise<void>;
  isLoading: boolean;

  // Initialization
  isEditMode: boolean;
  isInitialLoading: boolean;

  // Configuration
  categories?: Category[];
  labels?: string[];

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
  categories?: Category[];
  labels?: string[];
}

export function EventFormProvider({
  children,
  onClose,
  eventId,
  categories,
  labels
}: EventFormProviderProps) {
  const { isEditMode, isInitialLoading, initializeFormData } = useEventFormInitialization(eventId, categories);

  // Initialize form data with default category if categories are provided
  const initialFormData = (() => {
    const base = { ...defaultFormData };
    if (categories && categories.length > 0 && !base.category) {
      base.category = categories.find(c => c.selected)?.value ?? categories[0].value;
    }
    return base;
  })();

  const {
    formData,
    setFormData,
    handleInputChange,
    handleImageAdd,
    handleImageRemove,
    handleExistingImageRemove,
  } = useEventFormState(initialFormData);

  const { errors, clearError, validateForm } = useEventFormValidation();
  const { createEvent, updateEvent, isLoading } = useEventFormApi(labels);

  useEffect(() => {
    const initialData = initializeFormData();
    if (initialData) {
      setFormData(initialData);
    }
  }, [initializeFormData, setFormData]);

  const handleInputChangeWithClearError = (field: keyof FormData, value: string | File[]) => {
    handleInputChange(field, value);
    clearError(field);
  };

  const handleSubmit = async () => {
    if (!validateForm(formData)) return;

    try {
      if (isEditMode) {
        await updateEvent(eventId!, formData);
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
    setFormData,

    // Form handlers
    handleInputChange: handleInputChangeWithClearError,
    handleImageAdd,
    handleImageRemove,
    handleExistingImageRemove,

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
    isInitialLoading,

    // Configuration
    categories,
    labels,

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

