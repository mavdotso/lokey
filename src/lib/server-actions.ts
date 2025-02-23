'use server';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { signIn, signOut } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchAction } from 'convex/nextjs';

export async function signout() {
    await signOut({ redirectTo: '/' });
}

export async function signin(formData: FormData) {
    await signIn('resend', formData);
}

export async function handleInviteAcceptance(
    userId: string | undefined,
    inviteCode: string
) {
    if (userId) {
        try {
            await fetchAction(api.workspaceInvites.joinWorkspaceByInviteCode, {
                userId: userId as Id<"users">,
                inviteCode
            });
            redirect('/dashboard');
        } catch (error) {
            throw new Error('Failed to join workspace. Please try again.');
        }
    } else {
        const cookieStore = await cookies();
        cookieStore.set('inviteCode', inviteCode, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });
        redirect('/sign-in');
    }
}