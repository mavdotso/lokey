import { SignJWT, importPKCS8 } from 'jose';
import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { ConvexAdapter } from '@/lib/convex-adapter';
import { html, text } from '@/emails/magic-link';

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
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from,
                        to: email,
                        subject: `Sign in to ${host}`,
                        html: html({ url, host }),
                        text: text({ url, host }),
                    }),
                });

                if (!res.ok) {
                    throw new Error('Resend error: ' + JSON.stringify(await res.json()));
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
