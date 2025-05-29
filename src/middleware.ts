import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@skripsi/libs/auth.config';
import { verifyResetPasswordSignature } from '@skripsi/libs/signature';
import { verifySession } from '@skripsi/libs/session';
import type { JWT } from 'next-auth/jwt';

export const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const currentPath = req.nextUrl.pathname;

  // --- Logika untuk rute forgot-password, harus diprioritaskan ---
  if (
    currentPath.startsWith('/forgot-password/otp') ||
    currentPath.startsWith('/forgot-password/reset-password')
  ) {
    const signature = req.nextUrl.searchParams.get('signature');

    if (!signature) {
      return NextResponse.redirect(new URL('/forgot-password', req.url));
    }

    const verificationResult = verifyResetPasswordSignature(signature);

    if (!verificationResult.valid) {
      return NextResponse.redirect(new URL('/forgot-password', req.url));
    }

    if (verificationResult.expired) {
      return NextResponse.redirect(
        new URL('/forgot-password?error=Expired', req.url),
      );
    }

    // Jika signature valid dan tidak expired, lanjutkan
    return NextResponse.next();
  }

  // --- Logika untuk rute lain yang memerlukan sesi ---
  const sessionCookie = req.cookies.get('session')?.value;

  // Jika tidak ada sesi, dan bukan rute forgot-password (yang sudah ditangani di atas), lanjutkan
  // Ini penting agar aset statis atau rute publik lainnya bisa diakses tanpa sesi
  if (!sessionCookie) {
    return NextResponse.next();
  }

  try {
    const isValidSession = await verifySession(sessionCookie);

    if (!isValidSession) {
      const response = NextResponse.redirect(new URL('/signin', req.url));
      response.cookies.delete('session');
      response.cookies.delete('next-auth.session-token');
      response.cookies.delete('__Secure-next-auth.session-token');
      return response;
    }

    const session = req.auth?.token;

    if (session?.token) {
      const token = session.token as JWT;
      if (token && token.iat && token.rememberMe === false) {
        const sessionStartTime = token.iat * 1000;
        const currentTime = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000;

        if (currentTime - sessionStartTime > oneDayInMs) {
          const response = NextResponse.redirect(new URL('/signin', req.url));
          response.cookies.delete('next-auth.session-token');
          response.cookies.delete('__Secure-next-auth.session-token');
          response.cookies.delete('session');
          return response;
        }
      }
    }

    // Untuk semua rute lain yang sudah melewati verifikasi sesi, lanjutkan
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    const response = NextResponse.redirect(new URL('/signin', req.url));
    response.cookies.delete('session');
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    return response;
  }
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/main/:path*',
    '/dashboard/:path*',
  ],
};
