import { SupabaseUserProvider } from "@/lib/providers/supabase-user-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SupabaseUserProvider>
            {children}
        </SupabaseUserProvider>
    )
}