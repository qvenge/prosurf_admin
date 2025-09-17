'use client';

import { NavLink } from 'react-router';
import clsx from 'clsx';

import { Logotype } from '@/shared/ui/logotype';
import { Icon } from '@/shared/ui';

import styles from './navigation-bar.module.scss';
import { Suspense } from 'react';

interface NavItem {
  id: string;
  title: string;
  iconDefault: any;
  iconActive: any;
  path: string;
}

export interface NavigationBarProps {
  items: NavItem[];
  readonly className?: string;
}

export function NavigationBar({items, className}: NavigationBarProps) {
  return (
    <aside className={clsx(className, styles.root)}>
      <div className={styles.logo}>
        <Logotype />
      </div>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {items.map((item) => (
            <li
              key={item.id}
              className={styles.navItemWrapper}
            >
              <Suspense>
                <NavLink
                  className={({ isActive, isPending }) =>
                    clsx(styles.navItem, { [styles.navItemActive]: isActive || isPending })
                  }
                  to={item.path}
                >

                  {// @ts-ignore
                  ({ isActive }) => (
                    <Icon
                      src={isActive ? item.iconActive : item.iconDefault}
                      className={styles.navItemIcon}
                    />
                  )}
                  <div className={styles.navItemIconTitle}>{item.title}</div>
                </NavLink>
              </Suspense>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}