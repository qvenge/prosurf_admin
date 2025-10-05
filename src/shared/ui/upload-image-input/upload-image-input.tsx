'use client';

import clsx from 'clsx';
import { useRef } from 'react';
import { ButtonContainer } from '@/shared/ui';
import styles from './upload-image-input.module.scss';

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'accept' | 'ref' | 'onChange' | 'value'>

export interface UploadImageInputProps extends InputProps {
  value?: File | File[] | null;
  onChange?: (data: { file: File; preview: string }[] | { file: File; preview: string } | null) => void;
  multiple?: boolean;
  children?: React.ReactNode;
}

export function UploadImageInput({
  className,
  value,
  onChange,
  multiple = false,
  children,
  ...inputProps
}: UploadImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      onChange?.(null);
      return;
    }

    if (multiple) {
      const fileArray = Array.from(files);
      const processedFiles = await Promise.all(
        fileArray.map((file) => {
          return new Promise<{ file: File; preview: string }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({ file, preview: reader.result as string });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      onChange?.(processedFiles);

      // Clear input to allow re-selecting same files
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange?.({ file, preview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={clsx(
      className,
      styles.root,
      inputProps.disabled && styles.disabled
    )}>
      <input
        {...inputProps}
        className={styles.input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,image/heic"
        multiple={multiple}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <ButtonContainer onClick={handleClick}>
        {children}
      </ButtonContainer>
    </div>
  );
}