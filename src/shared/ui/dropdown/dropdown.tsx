'use client';

import clsx from 'clsx';
import { useEffect, useCallback, useRef, useState, type MouseEventHandler, useMemo } from 'react';
import { Portal, createContainer } from '@/shared/ui/portal';
import { ButtonContainer } from '@/shared/ui/button';
import { XBold } from '@/shared/ds/icons';
import { Icon } from '@/shared/ui/icon';

import styles from './dropdown.module.scss';

const DROPDOWN_CONTAINER_ID = 'dropdown-container-id';

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  togglerRef?: React.RefObject<any>;
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
  }, [onClose, isOpen]);

  return (
    <div
      className={clsx(className, styles.root, { [styles.open]: isOpen })}
      ref={ref}
    >
      {children}
    </div>
  );
}
