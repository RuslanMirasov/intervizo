import { Icon } from '@/components';
import Link from 'next/link';
import css from './Header.module.scss';

const Header = () => {
  return (
    <header className={css.Header}>
      <Icon name="logo" color="var(--color)" />
      <nav>
        <ul className={css.Navigation}>
          <li>
            <Link href="/">
              <Icon name="home" size="22" color="currentColor" />
              <span>Главная</span>
            </Link>
          </li>
          <li>
            <Link href="/interviews">
              <Icon name="mike" size="22" color="currentColor" />
              <span>Интервью</span>
            </Link>
          </li>
        </ul>
      </nav>
      <Link href="./" className={css.ProfileLink}>
        <Icon name="profile" color="currentColor" />
      </Link>
    </header>
  );
};

export default Header;
