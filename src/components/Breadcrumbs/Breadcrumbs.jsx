import Link from 'next/link';
import css from './Breadcrumbs.module.scss';

const Breadcrumbs = () => {
  return (
    <ul className={css.Breadcrumbs}>
      <li>
        <Link href="./">Главная</Link>
      </li>
      <li>
        <span>Добавить интервью</span>
      </li>
    </ul>
  );
};

export default Breadcrumbs;
