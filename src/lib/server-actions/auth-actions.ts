'use server';

import { createClient } from '@/db/server';

export async function signInWithEmail({ email }: { email: string }) {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            shouldCreateUser: true,
            emailRedirectTo: 'http://localhost:3000/welcome',
        },
    });
}
