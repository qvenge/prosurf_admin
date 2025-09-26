import { useContext } from 'react';
import { EventFormContext } from './EventFormContext';

export function useEventFormContext() {
  const context = useContext(EventFormContext);
  if (context === undefined) {
    throw new Error('useEventFormContext must be used within an EventFormProvider');
  }
  return context;
}