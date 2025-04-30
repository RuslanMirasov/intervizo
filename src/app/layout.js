import "@/styles/globals.scss";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

export const metadata = {
  title: "InterVizo",
  description: "Интервьюер",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="ru">
      <body className={`body ${inter.className}`}>
        <header className="header">HEADER</header>
        <main className="main">{children}</main>
        <footer className="footer">FOOTER</footer>
      </body>
    </html>
  );
};

export default RootLayout;
