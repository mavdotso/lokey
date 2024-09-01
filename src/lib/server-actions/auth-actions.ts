'use server';

import { createClient } from '@/lib/db/server';
import { getURL } from '@/lib/utils';

export async function signInWithEmail({ email }: { email: string }) {
    const supabase = createClient();

    const BASE_URL = getURL();

    const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            shouldCreateUser: true,
            emailRedirectTo: `${BASE_URL}/dashboard`,
        },
    });
}
