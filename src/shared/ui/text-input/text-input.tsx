'use client';

import clsx from 'clsx';
import { useState, useRef, useEffect } from 'react';
import { camelize } from '@/shared/lib/string';
import { Icon } from '@/shared/ui/icon';
import { EyeRegular, EyeSlashRegular } from '@/shared/ds/icons';
import styles from './text-input.module.scss'
import { ButtonContainer } from '@/shared/ui/button';
import IMask, { type InputMask } from 'imask';

type Parent = React.InputHTMLAttributes<HTMLInputElement>;

interface TextInputProps extends Omit<Parent, 'type' | 'size'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time' | 'datetime-local';
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
  children,
  ...inputProps
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const maskRef = useRef<InputMask | null>(null);

  const inputId = initialInputId ?? `${id ?? inputProps.name}-input`;

  let type = initialType;

  if (initialType === 'password') {
    type = showPassword ? 'text' : 'password';
  }

  useEffect(() => {
    if (initialType === 'tel' && inputRef.current) {
      maskRef.current = IMask(inputRef.current, {
        mask: '+{7} (000) 000-00-00',
        definitions: {
          '#': /[1-9]/
        }
      });

      return () => {
        if (maskRef.current) {
          maskRef.current.destroy();
        }
      };
    }
  }, [initialType]);


  const controls = [
    children,
    initialType === 'password' && <ButtonContainer
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
  ].filter(Boolean);


  return (
    <div
      id={id}
      className={clsx(
        className,
        styles.root,
        styles[`size${camelize(size)}`],
        inputProps.disabled && styles.disabled,
        inputProps.readOnly && styles.readOnly,
        error && styles.error,
        focused && styles.focus
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
          ref={inputRef}
          className={styles.input}
          id={inputId}
          type={type}
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
        />
        {controls.length > 0 && <div className={styles.controls}>
          {controls}
        </div>}
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
