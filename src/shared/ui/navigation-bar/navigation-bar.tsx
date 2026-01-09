'use client';

import { Suspense } from 'react';
import { NavLink } from 'react-router';
import clsx from 'clsx';

import { useLogout } from '@/shared/api';
import { SignOutRegular } from '@/shared/ds/icons';
import { Logotype } from '@/shared/ui/logotype';
import { Icon } from '@/shared/ui';

import styles from './navigation-bar.module.scss';

interface NavItem {
  id: string;
  title: string;
  iconDefault: string;
  iconActive: string;
  path: string;
}

export interface NavigationBarProps {
  items: NavItem[];
  readonly className?: string;
}

export function NavigationBar({items, className}: NavigationBarProps) {
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className={clsx(className, styles.root)}>
      <Logotype className={styles.logo} />
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
                  {({ isActive }) => (
                    <>
                      <Icon
                        src={isActive ? item.iconActive : item.iconDefault}
                        className={styles.navItemIcon}
                      />
                      <div className={styles.navItemIconTitle}>{item.title}</div>
                    </>
                  )}
                </NavLink>
              </Suspense>
            </li>
          ))}
        </ul>
      </nav>
      <footer className={styles.footer}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <Icon src={SignOutRegular} className={styles.logoutButtonIcon} />
          <span>Выйти</span>
        </button>
      </footer>
    </aside>
  );
}