import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/', // Home page - allow unauthenticated users to see website info
  '/auth/login',
  '/auth/register',
];

// All other routes require authentication

// Routes that are Admin-only
const adminOnlyRoutes = [
  '/admin',
  '/employees',
];

// Routes that are Employee-only (if any)
const employeeOnlyRoutes: string[] = [];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes (home page and auth pages)
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // All other routes require authentication
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie) {
    // Redirect to login page
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    const userType = session.userType;

    // Check Admin-only routes
    if (adminOnlyRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (userType !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Check Employee-only routes
    if (employeeOnlyRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (userType !== 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  } catch {
    // Invalid session, redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

