"use client"
import { Separator } from "@/components/ui/separator";
import { CogIcon, UsersIcon, WalletIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SettingsCard, SettingsCardProps } from "@/components/dashboard/settings/settings-card";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingScreen } from "@/components/global/loading-screen";
import { toast } from "sonner";
import { UserSettingsCard } from "@/components/dashboard/settings/user-settings-card";
import { User } from "@/convex/types";
import { Id } from "@/convex/_generated/dataModel";
import { UploadCard } from "@/components/dashboard/settings/upload-card";


const settingsItems = [
    { tabName: 'general', icon: CogIcon, name: 'General' },
    { tabName: 'users', icon: UsersIcon, name: 'Users' },
    { tabName: 'billing', icon: WalletIcon, name: 'Billing' },
];

export default function SettingsPage() {
    const router = useRouter();
    const { slug } = useParams();

    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaceSlug, setWorkspaceSlug] = useState('');
    const [workspaceUsers, setWorkspaceUsers] = useState<User[]>([])
    const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);

    const workspace = useQuery(api.workspaces.getWorkspaceBySlug, { slug: slug as string })
    const users = useQuery(api.workspaces.getWorkspaceUsers, workspace ? { _id: workspace._id } : 'skip')

    const editWorkspace = useMutation(api.workspaces.editWorkspace);
    const updateWorkspaceLogo = useMutation(api.workspaces.updateWorkspaceLogo);

    useEffect(() => {
        if (workspace) {
            setWorkspaceName(workspace.name)
            setWorkspaceSlug(workspace.slug)
        }

        if (users && users.users) {
            // Filter out the null's
            const filteredUsers = users.users.filter(
                (user): user is Exclude<typeof user, null> => user !== null && user._id !== undefined
            );
            setWorkspaceUsers(filteredUsers);
        }

    }, [workspace, users])

    if (!workspace) return <LoadingScreen />

    const generalSettings: SettingsCardProps[] = [
        { title: 'Workspace name', description: 'This is the name of your workspace on Lokey.', inputValue: workspaceName, setInputValue: setWorkspaceName, inputPlaceholder: workspaceName, isInputRequired: false, onSave: handleEdit, },
        { title: 'Workspace slug', description: 'This is the slug of your workspace on Lokey.', inputValue: workspaceSlug, setInputValue: setWorkspaceSlug, inputPlaceholder: workspaceSlug, isInputRequired: false, onSave: handleEdit, },
    ]

    async function handleEdit() {
        if (workspace) {
            const response = await editWorkspace({
                _id: workspace._id, updates: {
                    name: workspaceName,
                    slug: workspaceSlug
                }
            });

            if (response.success) {
                toast.success('Successfully updated the workspace')
                // TODO: push only if the slug is new
                router.push('/dashboard/' + workspaceSlug + '/settings')
            } else {
                toast.error('Something went wrong: ' + response.message)
            }
        }
    }

    async function handleLogoUpload(storageId: Id<"_storage">) {
        if (workspace) {
            setIsUpdatingLogo(true);
            try {
                const response = await updateWorkspaceLogo({
                    workspaceId: workspace._id,
                    storageId: storageId
                });

                if (response.success) {
                    toast.success('Successfully updated the workspace logo');
                } else {
                    toast.error('Failed to update workspace logo');
                }
            } catch (error) {
                console.error('Error updating workspace logo:', error);
                toast.error('An error occurred while updating the workspace logo');
            } finally {
                setIsUpdatingLogo(false);
            }
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center px-8 py-6">
                <h1 className="font-bold text-2xl">Settings</h1>
            </div>
            <Separator />
            <div className="flex flex-grow gap-4 px-8 py-4 overflow-hidden">
                <Tabs defaultValue="general" orientation="horizontal" className="flex gap-6 w-full h-full">
                    <TabsList className="flex flex-col flex-shrink-0 justify-start items-start gap-1 bg-transparent p-4 w-1/5 h-full text-left">
                        <p className="text-left text-muted-foreground text-sm">Workspace settings</p>
                        {settingsItems.map((item) => (
                            <TabsTrigger value={item.tabName} key={item.name} className="flex justify-start gap-2 hover:bg-muted data-[state=active]:bg-muted py-2 w-full data-[state=active]:shadomw-none font-normal text-left text-primary">
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="flex-grow w-4/5 overflow-hidden">
                        <div className="pr-4 h-full overflow-y-auto">
                            <TabsContent value="general" className="space-y-4">
                                {generalSettings.map((item, index) => (
                                    <SettingsCard key={index} {...item} />
                                ))}
                                <UploadCard
                                    title="Workspace Logo"
                                    description="Upload a logo for your workspace. Recommended size: 200x200px."
                                    acceptedFileTypes="image/*"
                                    onUploadComplete={handleLogoUpload}
                                />
                            </TabsContent>
                            <TabsContent value="users">
                                <UserSettingsCard users={workspaceUsers} workspace={workspace} />
                            </TabsContent>
                            <TabsContent value="billing">
                                <h2 className="font-bold text-lg">Billing</h2>
                                <p>Manage the billing for your workspace here.</p>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
