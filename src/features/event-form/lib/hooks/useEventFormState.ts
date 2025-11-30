import { useState } from 'react';
import type { FormData } from '../types';
import { defaultFormData } from '../constants';

export function useEventFormState(initialData: FormData = defaultFormData) {
  const [formData, setFormData] = useState<FormData>(initialData);

  const handleInputChange = (field: keyof FormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageAdd = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 10), // Max 10 images per OpenAPI spec
    }));
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    handleImageAdd,
    handleImageRemove,
  };
}
