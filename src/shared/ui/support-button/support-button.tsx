import { Link } from 'react-router';
import clsx from 'clsx';
import { Icon } from '@/shared/ui';
import { QuestionFill } from '@/shared/ds/icons';

import styles from './support-button.module.scss';

export interface SupportButtonProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export function SupportButton({
  className,
  href,
  ...props
}: SupportButtonProps) {
  return (
    <Link
      {...props}
      to={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(className, styles.root)}
    >
      <div className={styles.text}>
        Нужна помощь
      </div>
      <div className={styles.icon}>
        <Icon
          src={QuestionFill}
          width={28}
          height={28}
        />
      </div>
    </Link>
  )
}