import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Session management
export async function createSession(userId: number, userType: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify({ userId, userType }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

export async function getSession(): Promise<{ userId: number; userType: string } | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  
  if (!session) {
    return null;
  }
  
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Helper to get current user from session
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  
  return {
    userId: session.userId,
    userType: session.userType,
  };
}

