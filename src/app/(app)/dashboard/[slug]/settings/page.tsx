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

const workspaceSettingsItems = [
    { tabName: 'workspaceGeneral', icon: CogIcon, name: 'General' },
    { tabName: 'workspaceUsers', icon: UsersIcon, name: 'Users' },
    { tabName: 'workspaceBilling', icon: WalletIcon, name: 'Billing' },
];

const userSettingsItems = [
    { tabName: 'userGeneral', icon: CogIcon, name: 'General' },
    { tabName: 'userSecurity', icon: LockIcon, name: 'Security' },
];

export default async function SettingsPage({ params }: { params: { slug: string } }) {
    const session = await auth();
    const workspace = await fetchQuery(api.workspaces.getWorkspaceBySlug, { slug: params.slug });

    if (!workspace || !session || !session.user) {
        return <LoadingScreen />;
    }

    const workspaceUsers = await fetchQuery(api.workspaces.getWorkspaceUsers, { workspaceId: workspace._id });
    const workspaceInvites = await fetchQuery(api.invites.getWorkspaceInvites, { workspaceId: workspace._id });
    const user = await fetchQuery(api.users.getUser, { _id: session.user.id as Id<"users"> });
    const userWorkspaces = await fetchQuery(api.workspaces.getUserWorkspaces, { userId: session.user.id as Id<"users"> });

    if (!user || !workspace) {
        return redirect('/')
    }

    function isAdmin() {
        return user!._id === workspace!.ownerId;
    }

    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Settings" />
            <div className="flex flex-grow gap-4 px-8 py-4 overflow-hidden">
                <Tabs defaultValue={isAdmin() ? "workspaceGeneral" : "userGeneral"} orientation="horizontal" className="flex gap-6 w-full h-full">
                    <TabsList className="flex flex-col flex-shrink-0 justify-start items-start gap-1 bg-transparent p-4 w-1/5 h-full text-left">
                        {isAdmin() && (
                            <>
                                <p className="text-left text-muted-foreground text-sm">Workspace settings</p>
                                {workspaceSettingsItems.map((item) => (
                                    <TabsTrigger value={item.tabName} key={item.name} className="flex justify-start gap-2 hover:bg-muted data-[state=active]:bg-muted data-[state=active]:shadow-none py-2 w-full font-normal text-left text-primary">
                                        <item.icon className="w-4 h-4" />
                                        {item.name}
                                    </TabsTrigger>
                                ))}
                                <Separator className="my-4" />
                            </>
                        )}
                        <p className="text-left text-muted-foreground text-sm">User settings</p>
                        {userSettingsItems.map((item) => (
                            <TabsTrigger value={item.tabName} key={item.name} className="flex justify-start gap-2 hover:bg-muted data-[state=active]:bg-muted data-[state=active]:shadow-none py-2 w-full font-normal text-left text-primary">
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="flex-grow w-4/5 overflow-hidden">
                        <div className="pr-4 h-full overflow-y-auto">
                            <TabsContent value="workspaceGeneral">
                                <WorkspaceSettings workspace={workspace} />
                            </TabsContent>
                            <TabsContent value="workspaceUsers">
                                <UserSettingsCard users={workspaceUsers.users} workspace={workspace} invites={workspaceInvites} />
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