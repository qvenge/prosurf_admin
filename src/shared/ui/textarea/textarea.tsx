'use client';

import clsx from 'clsx';
import { camelize } from '@/shared/lib/string';
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
  value,
  ...textareaProps
}: TextareaProps) {
  const textareaId = initialTextareaId ?? `${id ?? textareaProps.name}-textarea`;
  const currentLength = typeof value === 'string' ? value.length : 0;

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
      <div className={styles.textareaWrapper}>
        <textarea
          className={styles.textarea}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          {...textareaProps}
        />
      </div>
      <div className={styles.footer}>
        {hint && <p className={styles.hint}>{hint}</p>}
        {showCounter && maxLength && (
          <p className={styles.counter}>
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}