'use client';

import clsx from 'clsx';
import { useEffect, useRef, useCallback } from 'react';
import { camelize, pluralize } from '@/shared/lib/string';
import styles from './textarea.module.scss';

type Parent = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

interface TextareaProps extends Omit<Parent, 'size'> {
  textareaId?: string;
  label?: string;
  hint?: string;
  error?: boolean;
  size?: 'small' | 'medium' | 'large';
  maxLength?: number;
  showCounter?: boolean;
  autoResize?: boolean;
}

export function Textarea({
  id,
  textareaId: initialTextareaId,
  label,
  style,
  className,
  hint,
  size = 'large',
  error,
  maxLength,
  showCounter = false,
  autoResize = false,
  value,
  ...textareaProps
}: TextareaProps) {
  const textareaId = initialTextareaId ?? `${id ?? textareaProps.name}-textarea`;
  const currentLength = typeof value === 'string' ? value.length : 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoResize) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [autoResize]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <div
      id={id}
      className={clsx(
        className,
        styles.root,
        styles[`size${camelize(size)}`],
        textareaProps.disabled && styles.disabled,
        textareaProps.readOnly && styles.readOnly,
        error && styles.error
      )}
      style={style}
    >
      {label && (
        <label
          className={clsx(styles.label)}
          htmlFor={textareaId}
        >
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        className={clsx(
          styles.textarea,
          autoResize && styles.autoResize
        )}
        id={textareaId}
        maxLength={maxLength}
        value={value}
        onInput={(e) => {
          adjustHeight();
          textareaProps.onInput?.(e);
        }}
        {...textareaProps}
      />
      <div className={styles.footer}>
        {hint && <p className={styles.hint}>{hint}</p>}
        {showCounter && maxLength && (
          <p className={styles.counter}>
            {currentLength > 0
              ? `${currentLength}/${maxLength}`
              : `До ${maxLength} ${pluralize(maxLength, ['символ', 'символа', 'символов'])}`
            }
          </p>
        )}
      </div>
    </div>
  );
}