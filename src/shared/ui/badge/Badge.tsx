import styles from './Badge.module.scss';

type BadgeVariant = 'success' | 'error' | 'warning' | 'secondary' | 'accent';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'secondary', className }: BadgeProps) {
  const variantClass = styles[variant];

  return (
    <span className={`${styles.badge} ${variantClass}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  );
}
