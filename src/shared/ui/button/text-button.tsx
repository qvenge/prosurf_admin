import clsx from 'clsx';

import { camelize } from '@/shared/lib/string';

import { ButtonContainer, ButtonContainerProps } from './button-container';
import styles from './text-button.module.scss';

export interface ButtonProps extends ButtonContainerProps {
  type: 'primary' | 'secondary' | 'tertiary' | 'negative' | 'alternative';
  size: 's' | 'm';
}

export function TextButton({
  children,
  className,
  type,
  size,
  ...props
}: ButtonProps) {
  return (
    <ButtonContainer
      className={clsx(
        className,
        styles.textButton,
        styles[`textButtonSize${camelize(size)}`],
        styles[`textButtonType${camelize(type)}`]
      )}
      {...props}
    >
      {children}
    </ButtonContainer>
  );
}