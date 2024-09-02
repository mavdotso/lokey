import { SignJWT, importPKCS8 } from 'jose';
import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { ConvexAdapter } from './convex-adapter';
import { text, VerificationEmail } from '@/components/emails/magic-link-email';
import { render } from '@react-email/render';
import { resend } from './resend';

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
            async sendVerificationRequest({ identifier: email, url }) {
                const { host } = new URL(url);

                const { data, error } = await resend.emails.send({
                    from: process.env.EMAIL_FROM!,
                    to: email,
                    subject: `Sign in to ${host}`,
                    react: VerificationEmail({ url, host }),
                    text: text({ url, host }),
                });

                if (error) {
                    throw new Error('Resend error: ' + JSON.stringify(error.message));
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
