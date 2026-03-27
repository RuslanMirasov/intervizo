'use client';

import { Button, Input } from '@/components';
import { useSession } from 'next-auth/react';
import css from './ProfileHeader.module.scss';

const ProfileHeader = () => {
  const { data: session } = useSession();
  const avatar = session?.user?.image || '/avatars/1.webp';

  return (
    <div className={css.ProfileHeader}>
      <div
        className={css.Avatar}
        style={{
          background: `url(${avatar})no-repeat center/cover`,
        }}
      ></div>
      <h1>{session?.user?.name || 'Загрузка...'}</h1>
      <Button className="small shere">Изменить имя</Button>
      <Input type="text" name="email" value={session?.user?.email || 'не найден'} label="E-mail" full disabled />
    </div>
  );
};

export default ProfileHeader;
