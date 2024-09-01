'use client'
import { SpacesList } from "@/components/spaces/spaces-list";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
    const { user } = useSupabaseUser();
    const router = useRouter();

    console.log(user)

    useEffect(() => {
        if (!user) {
            router.push('/sign-in');
        }
    }, [user, router]);

    if (!user) {
        return null;
    }

    return <SpacesList userId={user.id} />

}