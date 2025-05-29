import type { DefaultSession, DefaultUser } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      noWhatsapp: string | null;
      idTelegram: string | null;
      emailVerified: Date | null;
    } & DefaultSession['user'];
    token: JWT;
  }

  interface User extends DefaultUser {
    id: string;
    noWhatsapp: string | null;
    idTelegram: string | null;
    emailVerified: Date | null;
    rememberMe?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    tokenId: string;
    noWhatsapp: string | null;
    idTelegram: string | null;
    emailVerified: Date | null;
    rememberMe?: boolean;
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    id: string;
    noWhatsapp: string | null;
    idTelegram: string | null;
    emailVerified: Date | null;
  }
}
