import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { auth } from './auth';

// Function to generate a JWT token for WebSocket authentication
export async function generateSocketToken() {
  // Get the current session
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  // Create a token with minimal user data
  const payload = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };

  // Use the same secret as NextAuth
  const secret = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'your-jwt-secret',
  );

  // Create a short-lived token (1 hour)
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  return token;
}

// Server action to get a socket token
export async function getSocketToken() {
  try {
    const token = await generateSocketToken();

    // Store token in a cookie for easy access
    const cookieStore = await cookies();
    cookieStore.set('socket_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return { success: true, token };
  } catch (error) {
    console.error('Failed to generate socket token:', error);
    return { success: false, error: 'Authentication failed' };
  }
}
