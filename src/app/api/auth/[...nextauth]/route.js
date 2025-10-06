// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from 'next-auth/providers/google';
// import dbConnect from '@/lib/mongodb.js';
// import User from '@/models/User.js';

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         await dbConnect();
//         const user = await User.findOne({ email: credentials.email }).select('+password');

//         if (!user) {
//           throw new Error('E-mail или пароль \n указаны не верно!');
//         }

//         if (!user.password) {
//           throw new Error('Этот email зарегистрирован через Google. Войдите нажав на кнопку "Google".');
//         }

//         const isValidPassword = await user.comparePassword(credentials.password);

//         if (!isValidPassword) {
//           throw new Error('E-mail или пароль \n указаны не верно!');
//         }

//         const { _id, email, name, role, image } = user;
//         return {
//           id: _id.toString(),
//           email,
//           name,
//           role,
//           image,
//         };
//       },
//     }),

//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],

//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60,
//   },

//   callbacks: {
//     async redirect({ url, baseUrl }) {
//       if (url.startsWith(baseUrl)) return url;
//       if (url.startsWith('/')) return `${baseUrl}${url}`;
//       return baseUrl;
//     },

//     async signIn({ user, account, profile }) {
//       if (account.provider === 'google') {
//         try {
//           await dbConnect();

//           const providerId = account.providerAccountId;
//           const normalizedProfile = {
//             id: providerId,
//             name: profile?.name,
//             email: profile?.email,
//             picture: profile?.picture,
//           };

//           let existingUser = normalizedProfile.email ? await User.findOne({ email: normalizedProfile.email }) : null;

//           if (existingUser) {
//             if (!existingUser.providerId) existingUser.providerId = providerId;
//             if (!existingUser.image && normalizedProfile.picture) existingUser.image = normalizedProfile.picture;
//             if (!existingUser.name && normalizedProfile.name) existingUser.name = normalizedProfile.name;
//             await existingUser.save();

//             user.id = existingUser._id.toString();
//             user.role = existingUser.role;
//             user.image = existingUser.image;
//             user.name = existingUser.name;
//             return true;
//           }

//           const dbUser = await User.findOrCreateOAuthUser(normalizedProfile, 'google');
//           user.id = dbUser._id.toString();
//           user.role = dbUser.role;
//           user.image = dbUser.image;
//           user.name = dbUser.name;

//           return true;
//         } catch (error) {
//           console.error('Google signIn error:', error);
//           return false;
//         }
//       }

//       return true;
//     },

//     async jwt({ token, user, account }) {
//       if (user?.id) {
//         token.id = user.id;
//         token.role = user.role;
//         token.image = user.image;
//         token.name = user.name;
//         return token;
//       }

//       if (token?.id) {
//         try {
//           await dbConnect();
//           const dbUser = await User.findById(token.id);
//           if (dbUser) {
//             token.role = dbUser.role;
//             token.image = dbUser.image;
//             token.name = dbUser.name;
//           }
//         } catch (error) {
//           console.error('Ошибка загрузки данных пользователя:', error);
//         }
//       }

//       return token;
//     },

//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id;
//         session.user.role = token.role;
//         session.user.image = token.image;
//         session.user.name = token.name;
//       }
//       return session;
//     },
//   },

//   pages: {
//     signIn: '/login',
//     error: '/login',
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

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
        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user) throw new Error('E-mail или пароль \n указаны не верно!');
        if (!user.password)
          throw new Error('Этот email зарегистрирован через Google. Войдите нажав на кнопку "Google".');

        const ok = await user.comparePassword(credentials.password);
        if (!ok) throw new Error('E-mail или пароль \n указаны не верно!');

        const { _id, email, name, role, image } = user;
        return { id: _id.toString(), email, name, role, image };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
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
          const providerId = account.providerAccountId;
          const normalizedProfile = {
            id: providerId,
            name: profile?.name,
            email: profile?.email,
            picture: profile?.picture,
          };

          let existingUser = normalizedProfile.email ? await User.findOne({ email: normalizedProfile.email }) : null;

          if (existingUser) {
            if (!existingUser.providerId) existingUser.providerId = providerId;
            if (!existingUser.image && normalizedProfile.picture) existingUser.image = normalizedProfile.picture;
            if (!existingUser.name && normalizedProfile.name) existingUser.name = normalizedProfile.name;
            await existingUser.save();

            user.id = existingUser._id.toString();
            user.role = existingUser.role;
            user.image = existingUser.image;
            user.name = existingUser.name;
            return true;
          }

          const dbUser = await User.findOrCreateOAuthUser(normalizedProfile, 'google');
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          user.image = dbUser.image;
          user.name = dbUser.name;
          return true;
        } catch (e) {
          console.error('Google signIn error:', e);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image;
        token.name = user.name;
        return token;
      }
      if (token?.id) {
        try {
          await dbConnect();
          const dbUser = await User.findById(token.id);
          if (dbUser) {
            token.role = dbUser.role;
            token.image = dbUser.image;
            token.name = dbUser.name;
          }
        } catch (e) {
          console.error('Ошибка загрузки данных пользователя:', e);
        }
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
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
