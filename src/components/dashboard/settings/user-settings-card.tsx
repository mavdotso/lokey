import { User, Workspace } from "@/convex/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinkIcon } from "lucide-react";
import { WorkspaceMemberCard } from "./workspace-member-card";
import { Separator } from "@/components/ui/separator";

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
                    <Button onClick={() => { }}>
                        Invite
                    </Button>
                    <Button size={"icon"} variant={"outline"} onClick={() => { }}>
                        <LinkIcon className="w-4 h-4" />
                    </Button>
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