import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb.js';
import User from '@/models/User.js';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            throw new Error('E-mail или пароль \n указаны не верно!');
          }

          if (user.provider === 'google') {
            throw new Error('Этот email зарегистрирован через Google. Войдите нажав на кнопку "Google".');
          }

          const isValidPassword = await user.comparePassword(credentials.password);
          if (!isValidPassword) {
            throw new Error('E-mail или пароль \n указаны не верно!');
          }

          const { _id, email, name, role, image } = user;

          return {
            id: _id.toString(),
            email,
            name,
            role,
            image,
          };
        } catch (error) {
          throw error;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    },

    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: profile.email });

          if (existingUser && existingUser.provider === 'credentials') {
            existingUser.googleId = profile.sub;
            existingUser.image = profile.picture;
            await existingUser.save();
            user.id = existingUser._id.toString();
            user.role = existingUser.role;
            user.image = existingUser.image;
            user.name = existingUser.name;
            return true;
          }

          const dbUser = await User.findOrCreateOAuthUser(profile, 'google');
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          user.image = dbUser.image;
          user.name = dbUser.name;

          return true;
        } catch (error) {
          console.error('Google signIn error:', error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (account?.provider === 'google' || user) {
        try {
          await dbConnect();
          const dbUser = await User.findById(user?.id || token.id);

          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser._id.toString();
            token.image = dbUser.image;
            token.name = dbUser.name;
          }
        } catch (error) {
          console.error('Ошибка загрузки данных пользователя:', error);
        }
      }

      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.image = user.image;
        token.name = user.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.image;
        session.user.name = token.name;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
