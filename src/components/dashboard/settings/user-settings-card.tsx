import { User, Workspace, WorkspaceInvite } from "@/convex/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkspaceMemberCard } from "@/components/dashboard/settings/workspace-member-card";
import { Separator } from "@/components/ui/separator";
import { InviteLinkDialog } from "@/components/dashboard/settings//invite/invite-link-dialog";
import { InviteEmailDialog } from "@/components/dashboard/settings//invite/invite-email-dialog";
import { InviteCard } from "@/components/dashboard/settings/invite-card";

interface UserSettingsCardProps {
    workspace: Workspace
    users: Partial<User>[],
    invites: WorkspaceInvite[]
}

export function UserSettingsCard({ users, workspace, invites }: UserSettingsCardProps) {
    return (
        <Card className="shadow-none overflow-hidden">
            <CardHeader className="flex flex-row justify-between">
                <div>
                    <CardTitle>People</CardTitle>
                    <CardDescription>Teammates that have access to this workspace.</CardDescription>
                </div>
                <div className="flex gap-2">
                    {workspace &&
                        <>
                            <InviteEmailDialog workspace={workspace} />
                            <InviteLinkDialog workspace={workspace} />
                        </>
                    }
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-2">
                <Tabs defaultValue="account" className="w-full">
                    <TabsList>
                        <TabsTrigger value="account">Members</TabsTrigger>
                        <TabsTrigger value="invites">Invites</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        {users.map((user, index) => (
                            <WorkspaceMemberCard key={index} user={user} workspace={workspace} />
                        ))}
                    </TabsContent>
                    <TabsContent value="invites">
                        {invites.filter(invite => invite.invitedEmail).length > 0 ? (
                            invites
                                .filter(invite => invite.invitedEmail)
                                .map((invite, index) => (
                                    <InviteCard key={index} invite={invite} />
                                ))
                        ) : (
                            <p className="text-left text-muted-foreground text-sm">No pending invites</p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}