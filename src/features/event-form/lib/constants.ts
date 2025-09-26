import type { FormData } from './types';

export const disciplineOptions = [
  { value: 'training:surfing', label: 'Серфинг' },
  { value: 'training:surfskate', label: 'Серфскейт' },
  { value: 'tour', label: 'Тур' },
  { value: 'activity', label: 'Ивент' },
];

export const defaultFormData: FormData = {
  discipline: disciplineOptions[0].value,
  title: '',
  location: '',
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