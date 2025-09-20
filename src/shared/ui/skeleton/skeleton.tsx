import clsx from 'clsx';
import styles from './skeleton.module.scss';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function Skeleton({ children, className, ...props }: SkeletonProps) {
  return (
    <div className={clsx(className, styles.skeleton)} {...props}>
      {children}
    </div>
  );
}

export function SkeletonItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx(className, styles.skeletonItem)} {...props} />
  );
}

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
};

export function SkeletonText({
  className,
  lines = 1,
  style,
  ...props
}: SkeletonTextProps) {
  return (
    <div
      className={clsx(className, styles.skeletonText)}
      style={{
        height: `${lines}lh`,
        ...style,
      }}
      {...props}
    />
  );
}