'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './AlternativeTabs.module.scss';

export interface AlternativeTab<T = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface AlternativeTabsProps<T = string> {
  items: AlternativeTab<T>[];
  value?: T;
  onChange?: (value: T) => void;
  label?: ReactNode | string;
  className?: string;
  disabled?: boolean;
}

export function AlternativeTabs<T = string>({
  items,
  value,
  onChange,
  className,
  disabled = false,
}: AlternativeTabsProps<T>) {
  const handleOptionClick = (optionValue: T, isDisabled?: boolean) => {
    if (!disabled && !isDisabled && onChange) {
      onChange(optionValue);
    }
  };

  return (
    <div className={clsx(styles.root, className, {
      [styles.disabled]: disabled
    })}>
      {items.map((option, optionIndex) => {
        const isSelected = value === option.value;
        const isOptionDisabled = disabled || option.disabled;

        return (
          <div
            key={optionIndex}
            // type="button"
            className={clsx(styles.option, {
              [styles.selected]: isSelected,
              [styles.optionDisabled]: isOptionDisabled
            })}
            onClick={() => handleOptionClick(option.value, option.disabled)}
            // disabled={isOptionDisabled}
          >
            {option.label}
          </div>
        );
      })}
    </div>
  );
}