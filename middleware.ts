import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    const supabase = createMiddlewareClient({ req, res });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }
    }

    const emailLinkError = 'Email link is invalid or has expired';

    if (req.nextUrl.searchParams.get('error_description') === emailLinkError && req.nextUrl.pathname !== '/sign-in') {
        return NextResponse.redirect(new URL(`/sign-in?error_description=${req.nextUrl.searchParams.get('error_description')}`, req.url));
    }

    if (['/sign-in'].includes(req.nextUrl.pathname)) {
        if (session) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }
    return res;
}
