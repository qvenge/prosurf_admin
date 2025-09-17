import clsx from 'clsx';

import { camelize } from '@/shared/lib/string';

import { Icon } from '@/shared/ui';
import { CircleNotchBold } from '@/shared/ds/icons';
import { ButtonContainer, type ButtonContainerProps } from '../button/button-container';
import styles from './icon-button.module.scss';

const sizeValues = {
  s: 16,
  m: 20,
  l: 20,
};

export interface IconButtonProps extends Omit<ButtonContainerProps, 'children'> {
  type: 'primary' | 'secondary' | 'elevated';
  size: 's' | 'm' | 'l';
  src: string;
  loading?: boolean;
}

export function IconButton({
  className,
  type,
  size,
  src,
  loading,
  disabled,
  ...props
}: IconButtonProps) {
  const sizeValue = sizeValues[size];

  return (
    <ButtonContainer
      className={clsx(
        className,
        styles.root,
        styles[`size${camelize(size)}`],
        styles[`type${camelize(type)}`],
        loading && styles.loading
      )}
      disabled={disabled || loading}
      {...props}
    >
      <Icon className={styles.icon} src={loading ? CircleNotchBold : src} width={sizeValue} height={sizeValue} />
    </ButtonContainer>
  );
}