'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { getUserSubscriptionStatus } from '../db/queries';
import { AuthUser } from '@supabase/supabase-js';
import { Subscription } from '@/lib/db/database.types';

type SupabaseUserContextType = {
    user: AuthUser | null;
    subscription: Subscription | null;
};

const SupabaseUserContext = createContext<SupabaseUserContextType>({
    user: null,
    subscription: null,
});

export const useSupabaseUser = () => {
    return useContext(SupabaseUserContext);
};

interface SupabaseUserProviderProps {
    children: React.ReactNode;
}

export const SupabaseUserProvider: React.FC<SupabaseUserProviderProps> = ({
    children,
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    const supabase = createClientComponentClient();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                console.log(user);
                setUser(user);

                const { data, error } = await getUserSubscriptionStatus(user.id);
                if (data) setSubscription(data);
                if (error) {
                    toast('Unexpected Error', {
                        description: 'Oops! An unexpected error happened. Try again later.',
                    });
                }
            }
        };
        getUser();
    }, [supabase]);

    return (
        <SupabaseUserContext.Provider value={{ user, subscription }}>
            {children}
        </SupabaseUserContext.Provider>
    );
};