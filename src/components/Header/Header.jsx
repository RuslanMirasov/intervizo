'use client';

import { Icon } from '@/components';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import css from './Header.module.scss';

const Header = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <header className={css.Header}>
      <Icon name="logo" color="var(--color)" />

      {isAuthenticated && (
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
                <Icon name="interview" size="24" color="currentColor" />
                <span>Интервью</span>
              </Link>
            </li>
          </ul>
        </nav>
      )}

      {isAuthenticated && (
        <Link
          href="/profile"
          className={css.ProfileLink}
          style={{
            background: session?.user?.image ? `url(${session.user.image})no-repeat center center/cover` : 'none',
          }}
        >
          {!session?.user?.image && <Icon name="profile" color="currentColor" />}
        </Link>
      )}
    </header>
  );
};

export default Header;
