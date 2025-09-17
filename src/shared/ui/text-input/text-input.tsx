'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { camelize } from '@/shared/lib/string';
import { Icon } from '@/shared/ui/icon';
import { EyeRegular, EyeSlashRegular } from '@/shared/ds/icons';
import styles from './text-input.module.scss'
import { ButtonContainer } from '@/shared/ui/button';

type Parent = React.InputHTMLAttributes<HTMLInputElement>;

interface TextInputProps extends Omit<Parent, 'type' | 'size'> {
  type?: 'text' | 'email' | 'password';
  inputId?: string;
  label?: string;
  hint?: string;
  error?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function TextInput({
  id,
  inputId: initialInputId,
  type: initialType = 'text',
  label,
  style,
  className,
  hint,
  size = 'large',
  error,
  ...inputProps
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputId = initialInputId ?? `${id ?? inputProps.name}-input`;

  let type = initialType;

  if (initialType === 'password') {
    type = showPassword ? 'text' : 'password';
  }

  return (
    <div
      id={id}
      className={clsx(
        className,
        styles.root,
        styles[`size${camelize(size)}`],
        inputProps.disabled && styles.disabled,
        inputProps.readOnly && styles.readOnly,
        error && styles.error
      )}
      style={style}
    >
      {label && <label
        className={clsx(styles.label)}
        htmlFor={inputId}
      >
        {label}
      </label>}
      <div className={styles.inputWrapper}>
        <input
          className={styles.input}
          id={inputId}
          type={type}
          {...inputProps}
        />
        {initialType === 'password' &&
          <ButtonContainer
            className={styles.showPasswordButton}
            onClick={() => setShowPassword(!showPassword)}
          >
            <Icon
              className={styles.icon}
              src={showPassword ? EyeSlashRegular : EyeRegular}
              width={20}
              height={20}
            />
          </ButtonContainer>
        }
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
