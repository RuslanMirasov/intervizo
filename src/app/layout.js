import { Header } from '@/components';
import '@/styles/globals.scss';
import { Inter } from 'next/font/google';

const inter500 = Inter({
  weight: '500',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--500',
});

const inter600 = Inter({
  weight: '600',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--600',
});

const inter700 = Inter({
  weight: '700',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--700',
});

export const metadata = {
  title: 'InterVizo',
  description: 'Интервьюер',
};

const RootLayout = ({ children }) => {
  return (
    <html lang="ru">
      <body className={`body ${inter500.variable} ${inter600.variable} ${inter700.variable}`}>
        <Header />
        <main className="main">{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
