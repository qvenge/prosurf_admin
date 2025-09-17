'use client';

import clsx from 'clsx';
import { capitalize } from '@/shared/lib/string';

import styles from './header.module.scss';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children?: React.ReactNode;
}

export function Header({ className, children, title }: HeaderProps) {
  return (
    <header className={clsx(className, styles.root)}>
      <h1 className={styles.title}>{capitalize(title)}</h1>
      <div className={styles.rightContent}>
        {children}
      </div>
    </header>
  );
}

