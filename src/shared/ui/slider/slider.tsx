import clsx from 'clsx';

import styles from './slider.module.scss';

type ExcludedAttrs = 'type' | 'min' | 'max' | 'step' | 'value' | 'orientation';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, ExcludedAttrs> {
  min: number;
  max: number;
  value: number;
  step: number;
  orientation?: 'horizontal' | 'vertical';
}

export function Slider({
  min,
  max,
  value,
  step,
  className,
  style,
  orientation = 'horizontal',
  ...inputProps
}: SliderProps) {
  const progress = max === 0 ? 0 : (value - min) / (max - min);

  return (
    <div
      className={clsx(className, styles.slider, styles[orientation])}
      style={{
        ...style,
        // @ts-ignore
        "--progress": progress
      }}
    >
      <input
        className={styles.input}
        value={value}
        step={step}
        min={min}
        max={max}
        type="range"
        {...inputProps}
      />
    </div>
  );
}