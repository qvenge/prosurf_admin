export { EventForm } from './ui/EventForm';

// Export types for external usage
export type { EventFormProps, FormData, SessionForm, TimeSlot, ValidationErrors } from './lib/types';

// Export hooks for advanced usage
export { useEventFormState } from './lib/hooks/useEventFormState';
export { useEventFormValidation } from './lib/hooks/useEventFormValidation';
export { useEventFormApi } from './lib/hooks/useEventFormApi';
export { useEventFormInitialization } from './lib/hooks/useEventFormInitialization';