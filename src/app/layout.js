import { PopupProvider } from '@/context/PopupContext';

import { Header, Main, Popup } from '@/components';
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
        <PopupProvider>
          <Header />
          <Main>{children}</Main>
          <Popup />
        </PopupProvider>
      </body>
    </html>
  );
};

export default RootLayout;
