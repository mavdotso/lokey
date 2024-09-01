import { SignJWT, importPKCS8 } from 'jose';
import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { ConvexAdapter } from './convex-adapter';

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
            name: 'email',
            from: 'mavdotso <noreply@mav.so>',
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
});

declare module 'next-auth' {
    interface Session {
        convexToken: string;
    }
}
