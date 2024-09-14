import { SignJWT, importPKCS8 } from 'jose';
import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { ConvexAdapter } from '@/lib/convex-adapter';
import { getURL } from './utils';

if (process.env.CONVEX_AUTH_PRIVATE_KEY === undefined) {
    throw new Error('Missing CONVEX_AUTH_PRIVATE_KEY Next.js environment variable');
}

if (process.env.NEXT_PUBLIC_CONVEX_URL === undefined) {
    throw new Error('Missing NEXT_PUBLIC_CONVEX_URL Next.js environment variable');
}

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_URL!.replace(/.cloud$/, '.site');

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Resend({
            apiKey: process.env.AUTH_RESEND_KEY,
            from: process.env.EMAIL_FROM,
            async sendVerificationRequest({ identifier: email, url, provider: { server, from } }) {
                const { host } = new URL(url);
                const baseUrl = getURL();

                const response = await fetch(`${baseUrl}/api/emails/magic-link`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: email,
                        url,
                        host,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to send verification email');
                }
            },
        }),
    ],
    adapter: ConvexAdapter,
    callbacks: {
        async session({ session }) {
            const privateKey = await importPKCS8(process.env.CONVEX_AUTH_PRIVATE_KEY!, 'RS256');
            const convexToken = await new SignJWT({
                sub: session.userId,
            })
                .setProtectedHeader({ alg: 'RS256' })
                .setIssuedAt()
                .setIssuer(CONVEX_SITE_URL)
                .setAudience('convex')
                .setExpirationTime('1h')
                .sign(privateKey);
            return { ...session, convexToken };
        },
    },
    pages: {
        signIn: '/sign-in',
        verifyRequest: '/verify',
    },
});

declare module 'next-auth' {
    interface Session {
        convexToken: string;
    }
}
