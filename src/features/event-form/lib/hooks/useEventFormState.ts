import { useState } from 'react';
import type { FormData } from '../types';
import { defaultFormData, maxImages } from '../constants';

export function useEventFormState(initialData: FormData = defaultFormData) {
  const [formData, setFormData] = useState<FormData>(initialData);

  const handleInputChange = (field: keyof FormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageAdd = (files: File[]) => {
    setFormData(prev => {
      // Calculate remaining slots considering both existing and new images
      const totalCurrentImages = prev.existingImages.length + prev.images.length;
      const remainingSlots = maxImages - totalCurrentImages;
      const filesToAdd = files.slice(0, remainingSlots);

      return {
        ...prev,
        images: [...prev.images, ...filesToAdd],
      };
    });
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleExistingImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  const handlePreviewImageChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      previewImage: file,
      // Clear existing preview when new file is selected
      existingPreviewImage: file ? null : prev.existingPreviewImage,
    }));
  };

  const handlePreviewImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      previewImage: null,
      existingPreviewImage: null,
    }));
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    handleImageAdd,
    handleImageRemove,
    handleExistingImageRemove,
    handlePreviewImageChange,
    handlePreviewImageRemove,
  };
}
