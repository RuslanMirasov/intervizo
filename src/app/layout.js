import { PopupProvider } from '@/context/PopupContext';
import AuthSessionProvider from '@/context/SessionContext';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { FormsValidator, Header, Main, Popup } from '@/components';
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
        <AuthSessionProvider>
          <PopupProvider>
            <FormsValidator />
            <Header />
            <Main>{children}</Main>
            <Popup />
          </PopupProvider>
        </AuthSessionProvider>
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
