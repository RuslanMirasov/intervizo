'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components';
import css from './ProfileButtons.module.scss';
import { useState } from 'react';

const ProfileButtons = () => {
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      await signOut({
        callbackUrl: '/login',
        redirect: true,
      });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <div className={css.ProfileButtons}>
      <Button className="small shere">Сменить пароль</Button>
      <Button className="small red" onClick={handleLogout} loading={logoutLoading}>
        Выйти
      </Button>
    </div>
  );
};

export default ProfileButtons;
