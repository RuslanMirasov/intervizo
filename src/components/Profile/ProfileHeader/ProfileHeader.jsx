'use client';

import { Button, Input } from '@/components';
import { useSession } from 'next-auth/react';
import css from './ProfileHeader.module.scss';

const ProfileHeader = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <div className={css.ProfileHeader}>
      <div
        className={css.Avatar}
        style={{
          background: `url(${session?.user?.image ? session.user.image : '/avatars/1.webp'}) center/cover no-repeat`,
        }}
      ></div>
      <h1>{session?.user?.name || 'Загрузка...'}</h1>
      <Button className="small shere">Изменить имя</Button>
      <Input type="text" name="email" value={session?.user?.email || 'не найден'} label="E-mail" full disabled />
    </div>
  );
};

export default ProfileHeader;
