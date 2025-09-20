import Link from 'next/link';
import clsx from 'clsx';
import { Icon } from '@/components';
import css from './Button.module.scss';

const Button = ({
  href,
  type = 'button',
  children,
  onClick,
  disabled,
  className,
  loading = false,
  variant,
  full = false,
  icon,
}) => {
  const mappedClasses = className
    ?.split(' ')
    .map(cls => css[cls] || cls)
    .filter(Boolean);

  const classes = clsx(css.Button, mappedClasses, {
    [css.Google]: variant === 'google',
    [css.Loading]: loading,
    [css.Full]: full,
    [css.Disabled]: disabled,
  });

  return href ? (
    <Link href={href} className={classes} disabled={disabled}>
      {icon && !loading && <Icon name={icon} />}
      {children}
    </Link>
  ) : (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {icon && !loading && <Icon name={icon} />}
      {children}
    </button>
  );
};

export default Button;
