'use client';

import { Form, Button, Input } from '@/components';
import { extractErrorMessage } from '@/lib/api/extractErrorMessage';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePopup } from '@/hooks/usePopup';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openPopup, closePopup } = usePopup();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      const map = {
        AccessDenied: 'Доступ запрещён',
        OAuthAccountNotLinked: 'Эта почта уже связана с другим способом входа',
        Default: 'Ошибка входа',
      };
      openPopup({
        type: 'error',
        status: 'входа!',
        message: map[error] ?? map.Default,
        closePopup,
      });
      router.replace('/login'); // убираем ?error из URL
    }
  }, [searchParams, router, openPopup, closePopup]);

  const handlerSubmit = async e => {
    const formData = e.nativeEvent.formData;
    const { email, password } = formData;

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const { error } = result;
        openPopup({
          type: 'error',
          status: 'входа!',
          message: extractErrorMessage(error),
          closePopup,
        });
      } else if (result?.ok) {
        router.push('/');
      }
    } catch (error) {
      openPopup({
        type: 'error',
        status: 'входа!',
        message: extractErrorMessage(error),
        closePopup,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handlerSubmit}>
      <Input type="email" name="email" placeholder="E-mail" required />
      <Input type="password" name="password" placeholder="Пароль" required />
      <Button type="submit" full loading={isLoading}>
        Войти
      </Button>
    </Form>
  );
};

export default LoginForm;
