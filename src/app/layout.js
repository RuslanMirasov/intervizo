import { PopupProvider } from '@/context/PopupContext';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        <ToastContainer
          position="bottom-center"
          hideProgressBar={true}
          closeButton={false}
          transition={Zoom}
          autoClose={3000}
        />
      </body>
    </html>
  );
};

export default RootLayout;
