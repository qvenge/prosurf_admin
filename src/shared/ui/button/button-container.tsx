import clsx from 'clsx';
import styles from './button-container.module.scss';

type Parent = React.ButtonHTMLAttributes<HTMLButtonElement>;

export interface ButtonContainerProps extends Omit<Parent, 'type'> {
  htmlType?: Parent['type'];
  children?: React.ReactNode;
}

export function ButtonContainer({
  children,
  className,
  htmlType,
  ...props
}: ButtonContainerProps) {
  return (
    <button
      type={htmlType ?? 'button'}
      className={clsx(className, styles.buttonContainer)}
      {...props}
    >
      {children}
    </button>
  );
}