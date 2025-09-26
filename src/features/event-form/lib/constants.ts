import type { FormData } from './types';

export const defaultFormData: FormData = {
  title: '',
  location: '',
  prepayment: '',
  price: '',
  capacity: '',
  sessions: [{
    id: '1',
    date: '',
    timeSlots: [{
      id: 'time-1',
      startTime: ''
    }],
    duration: '1.5',
  }],
  photos: [],
  description: '',
  whatToBring: '',
};

export const defaultDuration = '1.5';
export const maxPhotos = 10;
export const maxDescriptionLength = 500;