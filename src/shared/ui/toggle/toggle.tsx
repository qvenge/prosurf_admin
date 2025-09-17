import clsx from 'clsx';
import styles from './toggle.module.scss';

type Parent = React.InputHTMLAttributes<HTMLInputElement>;;

export interface ToggleProps extends Omit<Parent, 'type'> {
  label?: string;
}

export function Toggle({
  className,
  style,
  label,
  ...inputProps
}: ToggleProps) {
  return (
    <label className={clsx(
      className,
      styles.root,
      inputProps.disabled && styles.disabled
    )} style={style}>
      <input
        className={styles.input}
        type="checkbox"
        {...inputProps}
      />
      <span className={clsx(styles.slider, styles.round)}></span>
      <div className={styles.label}>{label}</div>
    </label>
  )
}