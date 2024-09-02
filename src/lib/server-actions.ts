'use server';

import { signIn, signOut } from '@/lib/auth';

export async function signout() {
    await signOut({ redirectTo: '/' });
}

export async function signin(formData: FormData) {
    await signIn('resend', formData);
}
