import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;
  
  // Protected routes that require authentication
  const protectedPaths = ['/'];
  
  // Auth routes that should be accessible only when not authenticated
  const authPaths = ['/login', '/register'];
  
  const { pathname } = request.nextUrl;
  
  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  // Verify token
  const user = token ? verifyToken(token) : null;
  
  // If accessing protected route without token, redirect to login
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If accessing auth route with valid token, redirect to home
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Add user info to request headers for API routes
  if (user && pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user-id', user.id);
    requestHeaders.set('user-email', user.email);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/api/:path*',
  ],
};