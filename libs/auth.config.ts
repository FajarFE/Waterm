// auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

// Daftar rute privat yang membutuhkan autentikasi
const privateRoutes = [
  '/dashboard/monitoring',
  '/dashboard/limitations',
  '/verify-email/otp', // Add this line
];

// Creating the configuration object for NextAuth
export const authConfig = {
  trustHost: true,
  // Defining custom pages to tailor the authentication experience. Here, we redirect the default sign-in page to '/signin'.
  pages: {
    signIn: '/signin',
  },
  // Configuring callbacks for handling authorization logic during authentication flow.
  callbacks: {
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname, searchParams } = request.nextUrl;
      const callbackUrl = searchParams.get('callbackUrl');

      const isPrivateRoute = privateRoutes.some((route) =>
        pathname.startsWith(route),
      );

      // Jika sudah login dan mengakses halaman login, arahkan ke callback URL jika ada
      if (isLoggedIn && pathname === '/signin') {
        // Gunakan callbackUrl jika tersedia, jika tidak gunakan dashboard sebagai fallback
        const redirectUrl = callbackUrl || '/dashboard/monitoring';
        return NextResponse.redirect(
          new URL(redirectUrl, request.nextUrl.origin),
        );
      }

      // Jika rute privat dan pengguna belum login, arahkan ke halaman login
      if (isPrivateRoute && !isLoggedIn) {
        const loginUrl = new URL('/signin', request.nextUrl.origin);
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.href);
        return NextResponse.redirect(loginUrl);
      }

      // Jika rute privat dan pengguna sudah login, lanjutkan
      return true;
    },
  },

  // Placeholder array for authentication providers. We initialize it as empty for now, adding providers when required.
  providers: [], // We start with an empty array, adding providers as needed
} satisfies NextAuthConfig;
