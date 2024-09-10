import { User, Workspace } from "@/convex/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkspaceMemberCard } from "./workspace-member-card";
import { Separator } from "@/components/ui/separator";
import { InviteLinkDialog } from "./invite/invite-link-dialog";
import { InviteEmailDialog } from "./invite/invite-email-dialog";

interface UserSettingsCardProps {
    users: User[],
    workspace: Workspace
}

export function UserSettingsCard({ users, workspace }: UserSettingsCardProps) {
    return (
        <Card className="shadow-none overflow-hidden">
            <CardHeader className="flex flex-row justify-between">
                <div>
                    <CardTitle>People</CardTitle>
                    <CardDescription>Teammates that have access to this workspace.</CardDescription>
                </div>
                <div className="flex gap-2">
                    {workspace._id && <>
                        <InviteEmailDialog workspaceId={workspace._id} />
                        <InviteLinkDialog workspaceId={workspace._id} />
                    </>
                    }
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-2">
                <Tabs defaultValue="account" className="w-full">
                    <TabsList>
                        <TabsTrigger value="account">Members</TabsTrigger>
                        <TabsTrigger value="password">Invites</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account" className="space-y-4">
                        {users.map((user, index) => (
                            <WorkspaceMemberCard key={index} user={user} workspace={workspace} />
                        ))}
                    </TabsContent>
                    <TabsContent value="password">Change your password here.</TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}