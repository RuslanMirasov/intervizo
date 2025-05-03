import { Header, Main } from '@/components';
import '@/styles/globals.scss';
import { Inter } from 'next/font/google';

const inter = Inter({
  weight: ['500', '600', '700'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--inter',
});

export const metadata = {
  title: 'InterVizo',
  description: 'Интервьюер',
};

const RootLayout = ({ children }) => {
  return (
    <html lang="ru">
      <body className={`body ${inter.variable}`}>
        <Header />
        <Main>{children}</Main>
      </body>
    </html>
  );
};

export default RootLayout;
