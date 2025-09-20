import Link from 'next/link';
import { Section, ContentArea, LoginForm, GoogleSignInButton } from '@/components';

export const metadata = {
  title: 'InterVizo | Вход',
  description: 'Вход в систему',
};

const LoginPage = () => {
  return (
    <Section width="430px">
      <ContentArea align="center">
        <div className="form-wrapper">
          <h1>Войдите в учетную запись</h1>
          <LoginForm />
          <hr />
          <p>Или войдите через</p>
          <GoogleSignInButton />
        </div>
        <p>
          <span>
            Ещё нет аккаунта InterVizo? <Link href="/registration">Регистрация</Link>
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

export default LoginPage;
