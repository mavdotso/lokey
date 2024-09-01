import { auth } from './lib/auth';
import { NextResponse } from 'next/server';

export default auth((request) => {
    const isLoggedIn = !!request.auth;
    const { pathname } = request.nextUrl;

    if (isLoggedIn && pathname === '/sign-in') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!isLoggedIn && pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
