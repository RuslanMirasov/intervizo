import { withAuth } from 'next-auth/middleware';

const publicRoutes = ['/login', '/registration', '/rules', '/policy', '/auth/error', '/scoring', '/404', '/500'];

export default withAuth(function middleware(_req) {}, {
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;

      if (publicRoutes.includes(pathname)) return true;

      if (pathname.startsWith('/connect/') || pathname.startsWith('/room/')) {
        return true;
      }

      return !!token;
    },
  },
  pages: {
    signIn: '/login',
  },
});

// ВАЖНО: матчером исключаем API, _next, и системные страницы
export const config = {
  matcher: ['/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|404|500).*)'],
};
