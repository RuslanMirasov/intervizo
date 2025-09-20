import { Suspense } from 'react';
import { Section, ContentArea, RegisterForm, GoogleSignInButton } from '@/components';
import Link from 'next/link';

export const metadata = {
  title: 'InterVizo | Регистрация',
  description: 'Создать новый аккаунт',
};

const RegistrationPage = () => {
  return (
    <Section width="430px">
      <ContentArea align="center">
        <div className="form-wrapper">
          <h1>Регистрация</h1>
          <Suspense fallback={null}>
            <RegisterForm />
            <hr />
            <p>Или авторизоваться через</p>
            <GoogleSignInButton />
          </Suspense>
        </div>
        <p>
          <span>
            Уже есть аккаунт InterVizo? <Link href="/login">Войти</Link>
          </span>
        </p>
        <p>
          <span>
            Продолжая, вы соглашаетесь с&nbsp;<Link href="/rules">Условиями предоставления услуг</Link> и&nbsp;
            <Link href="/policy">Политикой конфиденциальности</Link>
          </span>
        </p>
      </ContentArea>
    </Section>
  );
};

export default RegistrationPage;
