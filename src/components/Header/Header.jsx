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
            <Link href="./">
              <Icon name="home" size="22" color="currentColor" />
              <span>Главная</span>
            </Link>
          </li>
          <li>
            <Link href="./">
              <Icon name="plus" size="22" color="currentColor" />
              <span>Add new</span>
            </Link>
          </li>
          <li>
            <Link href="./">
              <Icon name="question" size="22" color="currentColor" />
              <span>Question</span>
            </Link>
          </li>
          <li>
            <Link href="./">
              <Icon name="message" size="22" color="currentColor" />
              <span>Message</span>
            </Link>
          </li>
          <li>
            <Link href="./">
              <Icon name="close" size="22" color="currentColor" />
              <span>Close</span>
            </Link>
          </li>
          <li>
            <Link href="./">
              <Icon name="arrow" size="22" color="currentColor" />
              <span>Arrow</span>
            </Link>
          </li>
          <li>
            <Link href="./">
              <Icon name="mike" size="22" color="currentColor" />
              <span>Mike</span>
            </Link>
          </li>
          <li>
            <Link href="./">
              <Icon name="sound" size="22" color="currentColor" />
              <span>Sound</span>
            </Link>
          </li>
          <li>
            <Link href="./">
              <Icon name="video" size="22" color="currentColor" />
              <span>Video</span>
            </Link>
          </li>
          <li>
            <Link href="./">
              <Icon name="call" size="22" color="currentColor" />
              <span>Call</span>
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
