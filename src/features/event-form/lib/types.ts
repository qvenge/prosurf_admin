export interface TimeSlot {
  id: string;
  startTime: string;
}

export interface SessionForm {
  id: string;
  date: string;
  endDate?: string; // For range mode
  timeSlots: TimeSlot[];
  duration: string;
}

export interface Category {
  label: string;
  value: string;
  selected?: boolean;
}

export interface FormData {
  title: string;
  location: string;
  prepayment: string;
  price: string;
  capacity: string;
  sessions: SessionForm[];
  images: File[];
  description: string;
  whatToBring: string;
  category?: string;
}

export interface EventFormProps {
  onClose: () => void;
  eventId?: string; // For edit mode
  rangeMode?: boolean;
  categories?: Category[];
  labels?: string[];
}

export interface ValidationErrors {
  [key: string]: string;
}