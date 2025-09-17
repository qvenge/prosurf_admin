'use client';

import clsx from 'clsx';

import { Icon } from '@/shared/ui/icon';
import { CheckBold } from '@/shared/ds/icons';

import styles from './checkbox.module.scss';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // checked?: boolean;
  // onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  // value?: string;
  // checkBgColor?: string;
}

export function Checkbox({ className, checked, onChange, label, value }: CheckboxProps) {
  return (
    <label
      className={clsx(styles.checkboxRoot, className)}
      // style={{
      //   // @ts-ignore
      //   '--check-bg-color': checkBgColor
      // }}
      >
      <input
        className={styles.inputReal}
        type="checkbox"
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.input}>
        <Icon
          className={styles.checkIcon}
          src={CheckBold}
          width={16}
          height={16}
          aria-hidden
        />
      </span>
      <span className={styles.text}>{label}</span>
    </label>
  )
}