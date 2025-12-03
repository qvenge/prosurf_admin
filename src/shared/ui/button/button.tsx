import clsx from 'clsx';

import { Icon } from '@/shared/ui';
import { CircleNotchBold } from '@/shared/ds/icons';
import { camelize } from '@/shared/lib/string';

import { ButtonContainer, type ButtonContainerProps } from './button-container';
import styles from './button.module.scss';

export interface ButtonProps extends ButtonContainerProps {
  type: 'primary' | 'secondary' | 'elevated';
  size: 's' | 'm' | 'l';
  streched?: boolean;
  loading?: boolean;
}

const iconSizeValues = {
  s: 16,
  m: 20,
  l: 20,
};

export function Button({
  children,
  className,
  type,
  size,
  streched,
  disabled,
  loading,
  ...props
}: ButtonProps) {
  const iconSizeValue = iconSizeValues[size];

  return (
    <ButtonContainer
      className={clsx(
        className,
        styles.button,
        styles[`buttonSize${camelize(size)}`],
        styles[`buttonType${camelize(type)}`],
        streched && styles.streched,
        loading && styles.loading
      )}
      disabled={disabled || loading}
      {...props}
    >
      <div className={styles.content}>{children}</div>
      <div className={styles.loader}>
        <Icon className={styles.icon} src={CircleNotchBold} width={iconSizeValue} height={iconSizeValue} />
      </div>
    </ButtonContainer>
  );
}