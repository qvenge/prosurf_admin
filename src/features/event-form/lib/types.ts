export interface TimeSlot {
  id: string;
  startTime: string;
}

export interface SessionForm {
  id: string;
  date: string;
  timeSlots: TimeSlot[];
  duration: string;
}

export interface FormData {
  discipline: string;
  title: string;
  location: string;
  price: string;
  capacity: string;
  sessions: SessionForm[];
  photos: File[];
  description: string;
  whatToBring: string;
}

export interface EventFormProps {
  onClose: () => void;
  eventId?: string; // For edit mode
  rangeMode?: boolean;
}

export interface ValidationErrors {
  [key: string]: string;
}