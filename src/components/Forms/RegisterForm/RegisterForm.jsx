'use client';

import useRequest from '@/hooks/useRequest';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Form, Button, Input } from '@/components';

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { trigger: registerNewUser } = useRequest({
    url: '/api/auth/register',
    method: 'POST',
  });

  const handlerSubmit = async e => {
    const formData = e.nativeEvent.formData;

    setIsLoading(true);
    try {
      const registerSuccess = await registerNewUser(formData);

      if (registerSuccess) {
        const logIn = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (logIn?.error) {
          console.error('Регистрация прошла успешно, но не удалось войти автоматически. Попробуйте войти вручную.');
          router.push('/login');
        } else if (logIn?.ok) {
          console.log('Регистрация и вход выполнены успешно!');
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Произошла ошибка при регистрации', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handlerSubmit}>
      <Input type="text" name="name" placeholder="Ваше имя" />
      <Input type="email" name="email" placeholder="E-mail" required />
      <Input type="password" name="password" placeholder="Пароль" required />
      <Button type="submit" full loading={isLoading}>
        Зарегистрироваться
      </Button>
    </Form>
  );
};

export default RegisterForm;
