import { prisma } from './db';
import { decrypt } from './encryptionSession';

export async function verifySession(sessionCookie: string) {
  try {
    const payload = await decrypt(sessionCookie);
    if (!payload || !payload.userId) {
      return false;
    }
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });
    return !!user;
  } catch (error) {
    console.error('Session verification error:', error);
    return false;
  }
}
