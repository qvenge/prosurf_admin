import type { FormData } from './types';

export const defaultFormData: FormData = {
  title: '',
  location: '',
  mapUrl: '',
  prepayment: '',
  price: '',
  currency: 'RUB',
  capacity: '',
  images: [],
  existingImages: [],
  description: '',
  whatToBring: '',
};

export const maxImages = 10;
export const maxDescriptionLength = 500;