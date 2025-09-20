'use client';

import clsx from 'clsx';
import { useEffect, useRef } from 'react';

import styles from './dropdown.module.scss';

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  togglerRef?: React.RefObject<HTMLElement>;
}

export function Dropdown({
  onClose,
  isOpen,
  children,
  className,
  togglerRef
}: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        (togglerRef?.current != null && togglerRef.current.contains(event.target as Node)) ||
        (ref.current && ref.current.contains(event.target as Node))
      ) {
        return;
      }

      onClose?.();
    };

    document.addEventListener('click', handleClickOutside);

    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose, isOpen, togglerRef]);

  return (
    <div
      className={clsx(className, styles.root, { [styles.open]: isOpen })}
      ref={ref}
    >
      {children}
    </div>
  );
}
