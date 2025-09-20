import { withAuth } from 'next-auth/middleware';

export default withAuth(function middleware(req) {}, {
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;
      const publicRoutes = ['/login', '/registration', '/rules', '/policy', '/auth/error', '/scoring'];

      if (publicRoutes.includes(pathname) || pathname.startsWith('/connect/') || pathname.startsWith('/room/')) {
        return true;
      }

      if (pathname.startsWith('/api/')) {
        return true;
      }

      return !!token;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|webm|ogg|mp3|wav|pdf|txt|xml|json|webmanifest|map|css|js|woff2?|ttf|otf)).*)',
  ],
};
