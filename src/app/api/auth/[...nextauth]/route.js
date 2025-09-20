import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth.js';

// NextAuth обработчик для всех HTTP методов (GET, POST)
const handler = NextAuth(authOptions);

// Экспортируем обработчики для App Router
export { handler as GET, handler as POST };
