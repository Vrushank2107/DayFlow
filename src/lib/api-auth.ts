import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  return null; // No error, user is authenticated
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  if (user.userType !== 'ADMIN') {
    return NextResponse.json(
      { error: 'This action requires admin account' },
      { status: 403 }
    );
  }
  return null; // No error, user is admin
}

export async function requireEmployee() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  if (user.userType !== 'EMPLOYEE') {
    return NextResponse.json(
      { error: 'This action requires employee account' },
      { status: 403 }
    );
  }
  return null; // No error, user is employee
}

export async function getAuthenticatedUser() {
  return await getCurrentUser();
}

