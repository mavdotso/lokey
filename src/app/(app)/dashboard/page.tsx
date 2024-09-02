import { SpacesDropdown } from '@/components/spaces/spaces-dropdown';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
    const session = await auth();
    return <SpacesDropdown userId={session!.user!.id!} />;
}