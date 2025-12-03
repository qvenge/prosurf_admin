import type { CSSProperties } from 'react';
import clsx from 'clsx';

import styles from './icon.module.scss';

export interface IconProps {
  src: string;
  width?: number | string
  height?: number | string;
  className?: string;
}

const setUnits = (value: number | string) => typeof value === 'number' ? `${value}px` : value;

export function Icon({ src, ...restProps }: IconProps) {
  const params = Object.assign(
    {},
    typeof src === 'object' ? src : { src },
    restProps
  );

  const style: CSSProperties = {
    WebkitMaskImage: `url(${params.src})`,
    maskImage: `url(${params.src})`,
  };

  if (params.width != null) {
    style.width = setUnits(params.width);
  }

  if (params.height != null) {
    style.height = setUnits(params.height);
  }

  return (
    <div
      aria-hidden
      style={style}
      className={clsx(styles.icon, params.className)}
    />
  );
}