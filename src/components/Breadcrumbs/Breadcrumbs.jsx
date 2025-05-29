import Link from 'next/link';
import css from './Breadcrumbs.module.scss';

const Breadcrumbs = ({ items }) => {
  if (!items) return null;

  return (
    <ul className={css.Breadcrumbs}>
      {items.map((item, index) => {
        const { label, href } = item;
        return <li key={index}>{href ? <Link href={href}>{label}</Link> : <span>{label}</span>}</li>;
      })}
    </ul>
  );
};

export default Breadcrumbs;
