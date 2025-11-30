import type { FormData } from './types';

export const defaultFormData: FormData = {
  title: '',
  location: '',
  prepayment: '',
  price: '',
  capacity: '',
  images: [],
  description: '',
  whatToBring: '',
};

export const maxImages = 10;
export const maxDescriptionLength = 500;