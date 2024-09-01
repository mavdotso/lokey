'use client'
import { SpacesList } from "@/components/spaces/spaces-list";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user } = useSupabaseUser();
    const router = useRouter();
    console.log(user)

    if (!user) return router.push('/sign-in');

    return <SpacesList userId={user.id} />

}