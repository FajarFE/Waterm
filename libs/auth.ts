import NextAuth, { type Session } from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getUserFromDb } from './credentials';
import GitHub from 'next-auth/providers/github';
import { authConfig } from './auth.config';
import type { JWT } from 'next-auth/jwt';
import { InjectDataAfterRegister } from '@skripsi/prisma/seeder';

const THIRTY_DAYS = 30 * 24 * 60 * 60;

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'boolean' },
      },
      authorize: async (credentials) => {
        try {
          const parsedCredentials = z
            .object({
              email: z.string().email(),
              password: z.string().min(6),
              rememberMe: z.boolean().optional(),
            })
            .safeParse(credentials);

          if (!parsedCredentials.success) {
            throw new Error('Invalid credentials format');
          }
          const { email, password } = parsedCredentials.data;
          const user = await getUserFromDb(email);
          if (!user || !user.password) {
            return null;
          }
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (isPasswordValid) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
              image: user.image,
              noWhatsapp: user.noWhatsapp || null,
              idTelegram:
                typeof user.idTelegram === 'string' ? user.idTelegram : null,
              rememberMe: parsedCredentials.data.rememberMe,
            };
          }

          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  events: {
    createUser: async ({ user }) => {
      try {
        await InjectDataAfterRegister(user.id);
      } catch (error) {
        throw new Error('Error injecting initial data for new user');
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session: sessionDataFromUpdate }) {
      if (user) {
        token.id = user.id as string;
        token.noWhatsapp = user.noWhatsapp;
        token.idTelegram = user.idTelegram;
        token.emailVerified = user.emailVerified;
        token.rememberMe = (user as any).rememberMe || false;
      }
      if (trigger === 'update' && sessionDataFromUpdate) {
        // Payload yang dikirim ke `unstable_update` akan ada di sini
        if (sessionDataFromUpdate.user?.emailVerified !== undefined) {
          token.emailVerified = sessionDataFromUpdate.user.emailVerified;
        }
        // ... update field lain jika perlu
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.noWhatsapp = token.noWhatsapp;
        session.user.idTelegram = token.idTelegram;
        session.user.emailVerified = token.emailVerified;
      }
      session.token = token;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: THIRTY_DAYS,
    updateAge: 24 * 60 * 60, // 24 hours
  },
});
