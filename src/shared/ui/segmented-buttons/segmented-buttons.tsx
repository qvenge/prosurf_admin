'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './segmented-buttons.module.scss';

export interface SegmentedButtonOption<T = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedButtonsProps<T = string> {
  options: SegmentedButtonOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function SegmentedButtons<T = string>({
  options,
  value,
  onChange,
  label,
  className,
  disabled = false,
}: SegmentedButtonsProps<T>) {
  const handleOptionClick = (optionValue: T, isDisabled?: boolean) => {
    if (!disabled && !isDisabled && onChange) {
      onChange(optionValue);
    }
  };

  return (
    <div className={clsx(styles.root, className, {
      [styles.disabled]: disabled
    })}>
      {label && (
        <div className={styles.label}>
          {label}
        </div>
      )}
      <div className={styles.content}>
        {options.map((option, optionIndex) => {
          const isSelected = value === option.value;
          const isOptionDisabled = disabled || option.disabled;

          return (
            <button
              key={optionIndex}
              type="button"
              className={clsx(styles.option, {
                [styles.selected]: isSelected,
                [styles.optionDisabled]: isOptionDisabled
              })}
              onClick={() => handleOptionClick(option.value, option.disabled)}
              disabled={isOptionDisabled}
            >
              <span className={styles.optionLabel}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}