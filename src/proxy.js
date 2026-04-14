import { NextResponse } from 'next/server';

export function proxy(request) {
  const isAuth = request.cookies.get('event_auth')?.value === 'true';
  const { pathname } = request.nextUrl;

  // Protect the root route and any other frontend routes except /login
  if (!isAuth && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to home if logged in and trying to go to login
  if (isAuth && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login'],
};
