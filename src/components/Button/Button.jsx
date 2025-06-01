import Link from 'next/link';
import css from './Button.module.scss';

const Button = ({ href, type = 'button', children, onClick, disabled, className, loading = false }) => {
  const classes = [css.Button];

  if (className) {
    className.split(' ').forEach(cls => classes.push(css[cls]));
  }

  if (loading) {
    classes.push(css.Loading);
  }

  const classNames = classes.join(' ');

  return href ? (
    <Link href={href} className={classNames} disabled={disabled}>
      {children}
    </Link>
  ) : (
    <button type={type} className={classNames} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
