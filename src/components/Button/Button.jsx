import Link from 'next/link';
import css from './Button.module.scss';

const Button = ({ href, type = 'button', children, onClick, className }) => {
  const classes = [css.Button];

  if (className) {
    className.split(' ').forEach(cls => classes.push(css[cls]));
  }

  const classNames = classes.join(' ');

  return href ? (
    <Link href={href} className={classNames}>
      {children}
    </Link>
  ) : (
    <button type={type} className={classNames} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
