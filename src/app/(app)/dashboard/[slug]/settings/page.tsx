import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Separator } from "@/components/ui/separator";
import { CogIcon, LockIcon, UsersIcon, WalletIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserSettingsCard } from "@/components/dashboard/settings/user-settings-card";
import { BillingSettings } from "@/components/dashboard/settings/billing/billing-settings";
import { PageHeader } from "@/components/global/page-header";
import { LoadingScreen } from "@/components/global/loading-screen";
import { auth } from "@/lib/auth";
import { Id } from "@/convex/_generated/dataModel";
import { redirect } from "next/navigation";
import { UserSettings } from "@/components/dashboard/settings/user-settings";
import { WorkspaceSettings } from "@/components/dashboard/settings/workspace-settings";
import { User } from "@/convex/types";

const workspaceSettingsItems = [
    { tabName: 'workspaceGeneral', icon: CogIcon, name: 'General' },
    { tabName: 'workspaceUsers', icon: UsersIcon, name: 'Users' },
    { tabName: 'workspaceBilling', icon: WalletIcon, name: 'Billing' },
];

const userSettingsItems = [
    { tabName: 'userGeneral', icon: CogIcon, name: 'General' },
    { tabName: 'userSecurity', icon: LockIcon, name: 'Security' },
];

export default async function SettingsPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const session = await auth();
    const workspace = await fetchQuery(api.workspaces.getWorkspaceBySlug, { slug: params.slug });

    if (!workspace || !session || !session.user) {
        return <LoadingScreen />;
    }

    const workspaceUsers = await fetchQuery(api.workspaces.getWorkspaceUsers, { workspaceId: workspace._id });
    const workspaceInvites = await fetchQuery(api.workspaceInvites.getWorkspaceInvites, { workspaceId: workspace._id });
    const user = await fetchQuery(api.users.getUser, { userId: session.user.id as Id<"users"> });
    const userWorkspaces = await fetchQuery(api.workspaces.getUserWorkspaces, { userId: session.user.id as Id<"users"> });

    if (!user || !workspace) {
        return redirect('/')
    }

    function isAdmin() {
        return user!._id === workspace!.ownerId;
    }

    const workspaceTabTriggers = workspaceSettingsItems.map((item) => (
        <TabsTrigger
            value={item.tabName}
            key={item.name}
            className="flex justify-start gap-2 data-[state=active]:bg-muted hover:bg-muted data-[state=active]:shadow-none py-2 w-full font-normal text-primary text-left"
        >
            <item.icon className="w-4 h-4" />
            {item.name}
        </TabsTrigger>
    ));

    const userTabTriggers = userSettingsItems.map((item) => (
        <TabsTrigger
            value={item.tabName}
            key={item.name}
            className="flex justify-start gap-2 data-[state=active]:bg-muted hover:bg-muted data-[state=active]:shadow-none py-2 w-full font-normal text-primary text-left"
        >
            <item.icon className="w-4 h-4" />
            {item.name}
        </TabsTrigger>
    ));

    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Settings" />
            <div className="flex gap-4 px-8 py-4 overflow-hidden grow">
                <Tabs defaultValue={isAdmin() ? "workspaceGeneral" : "userGeneral"} orientation="horizontal" className="flex gap-6 w-full h-full">
                    <TabsList className="flex flex-col justify-start items-start gap-1 bg-transparent p-4 w-1/5 h-full text-left shrink-0">
                        {isAdmin() && (
                            <>
                                <p className="text-muted-foreground text-sm text-left">Workspace settings</p>
                                {workspaceTabTriggers}
                                <Separator className="my-4" />
                            </>
                        )}
                        <p className="text-muted-foreground text-sm text-left">User settings</p>
                        {userTabTriggers}
                    </TabsList>
                    <div className="w-4/5 overflow-hidden grow">
                        <div className="pr-4 h-full overflow-y-auto">
                            <TabsContent value="workspaceGeneral">
                                <WorkspaceSettings workspace={workspace} />
                            </TabsContent>
                            <TabsContent value="workspaceUsers">
                                <UserSettingsCard
                                    users={(workspaceUsers?.users as User[]) || []}
                                    workspace={workspace}
                                    invites={workspaceInvites}
                                />
                            </TabsContent>
                            <TabsContent value="workspaceBilling">
                                {user && <BillingSettings user={user} workspace={workspace} />}
                            </TabsContent>
                            <TabsContent value="userGeneral">
                                <UserSettings
                                    user={user}
                                    userWorkspaces={userWorkspaces}
                                />
                            </TabsContent>
                            <TabsContent value="userSecurity">
                                <h2 className="font-bold text-lg">User security</h2>
                                <p>Manage the security settings for your account here.</p>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}