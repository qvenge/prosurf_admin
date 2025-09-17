import clsx from 'clsx';

import styles from './logotype.module.scss';
import logo from './logo.svg';

export function Logotype({className}: {className?: string}) {
  return (
    <img
      className={clsx(className, styles.logo)}
      src={logo}
      alt="ProSurf Logotype"
    />
  );
}
