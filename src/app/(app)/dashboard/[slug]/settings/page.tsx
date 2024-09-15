"use client"
import { Separator } from "@/components/ui/separator";
import { CogIcon, LockIcon, UsersIcon, WalletIcon } from "lucide-react";
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
import { ConfirmationDialog } from "@/components/global/confirmation-dialog";
import { useSession } from "next-auth/react";
import { signout } from "@/lib/server-actions";
import { SelectCard } from "@/components/dashboard/settings/select-card";

const workspaceSettingsItems = [
    { tabName: 'workspaceGeneral', icon: CogIcon, name: 'General' },
    { tabName: 'workspaceUsers', icon: UsersIcon, name: 'Users' },
    { tabName: 'workspaceBilling', icon: WalletIcon, name: 'Billing' },
];

const userSettingsItems = [
    { tabName: 'userGeneral', icon: CogIcon, name: 'General' },
    { tabName: 'userSecurity', icon: LockIcon, name: 'Security' },
];

export default function SettingsPage() {
    const router = useRouter();
    const { slug } = useParams();
    const session = useSession()

    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaceSlug, setWorkspaceSlug] = useState('');
    const [workspaceUsers, setWorkspaceUsers] = useState<User[]>([])
    const [confirmDelete, setConfirmDelete] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [defaultWorkspace, setDefaultWorkspace] = useState('');
    const [confirmUserDelete, setConfirmUserDelete] = useState('');
    const [isUserDeleteDialogOpen, setIsUserDeleteDialogOpen] = useState(false);

    const workspace = useQuery(api.workspaces.getWorkspaceBySlug, { slug: slug as string })
    const users = useQuery(api.workspaces.getWorkspaceUsers, workspace ? { _id: workspace._id } : 'skip')
    const invites = useQuery(api.invites.getWorkspaceInvites, workspace ? { workspaceId: workspace._id } : 'skip')

    const user = useQuery(api.users.getUser, { _id: session.data?.user?.id as Id<"users"> });
    const userWorkspaces = useQuery(api.workspaces.getUserWorkspaces);

    const editWorkspace = useMutation(api.workspaces.editWorkspace);
    const updateWorkspaceLogo = useMutation(api.workspaces.updateWorkspaceLogo);
    const deleteWorkspaceMutation = useMutation(api.workspaces.deleteWorkspace);

    const editUser = useMutation(api.users.editUser);
    const updateUserAvatar = useMutation(api.users.updateUserAvatar);
    const deleteUserMutation = useMutation(api.users.deleteUser);



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

    useEffect(() => {
        if (session.data?.user) {
            setUserName(session.data.user.name || '');
            setUserEmail(session.data.user.email || '');
        }
    }, [session.data?.user]);

    useEffect(() => {
        if (user && userWorkspaces && userWorkspaces.length > 0) {
            if (user.defaultWorkspace) {
                setDefaultWorkspace(user.defaultWorkspace);
            } else {
                setDefaultWorkspace(userWorkspaces[0]._id);
            }
        }
    }, [user, userWorkspaces]);

    if (!workspace) return <LoadingScreen />

    const workspaceGeneralSettings: SettingsCardProps[] = [
        { title: 'Workspace name', description: 'This is the name of your workspace on Lokey.', inputValue: workspaceName, setInputValue: setWorkspaceName, inputPlaceholder: workspaceName, isInputRequired: false, onSave: handleEdit, },
        { title: 'Workspace slug', description: 'This is the slug of your workspace on Lokey.', inputValue: workspaceSlug, setInputValue: setWorkspaceSlug, inputPlaceholder: workspaceSlug, isInputRequired: false, onSave: handleEdit, },
    ]

    const userGeneralSettings: SettingsCardProps[] = [
        { title: 'Name', description: 'This is the name of your account on Lokey.', inputValue: userName, setInputValue: setUserName, inputPlaceholder: userName, isInputRequired: false, onSave: handleEditUser, },
        // { title: 'Account email', description: 'This is an email address you use to sign in to Lokey.', inputValue: userEmail, setInputValue: setUserEmail, inputPlaceholder: userEmail, isInputRequired: false, onSave: handleEditUser, },
    ]

    const workspaceOptions = userWorkspaces?.map(workspace => ({
        value: workspace._id,
        label: workspace.name
    })) || [];

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
                // Redirect only if the slug has changed
                if (workspaceSlug !== workspace.slug) {
                    router.push('/dashboard/' + workspaceSlug + '/settings')
                }
            } else {
                toast.error('Something went wrong', { description: response.message })
            }
        }
    }

    async function handleLogoUpload(storageId: Id<"_storage">) {
        if (workspace) {
            try {
                const response = await updateWorkspaceLogo({
                    _id: workspace._id,
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
            }
        }
    }

    async function handleDeleteWorkspace() {
        if (workspace && confirmDelete === `DELETE ${workspace.name}`) {
            setIsDeleteDialogOpen(true);
        } else {
            toast.error(`Please type "DELETE ${workspace?.name}" to confirm deletion`);
        }
    }

    async function confirmDeleteWorkspace() {
        if (workspace) {
            const response = await deleteWorkspaceMutation({ _id: workspace._id });
            if (response.success) {
                toast.success('Workspace deleted successfully');
                router.push('/dashboard');
            } else {
                toast.error('Failed to delete workspace', { description: response.message });
            }
        }
    }

    async function handleEditUser() {
        const updates: {
            name?: string;
            email?: string;
            defaultWorkspace?: Id<"workspaces"> | undefined;
        } = {};

        if (userName !== session.data?.user?.name) {
            updates.name = userName;
        }

        if (userEmail !== session.data?.user?.email) {
            updates.email = userEmail;
        }

        if (defaultWorkspace) {
            updates.defaultWorkspace = defaultWorkspace as Id<"workspaces">;
        } else {
            updates.defaultWorkspace = undefined;
        }

        if (Object.keys(updates).length > 0) {
            const response = await editUser({ updates });

            if (response.success) {
                toast.success('Successfully updated user profile');
            } else {
                toast.error('Something went wrong', { description: response.message });
            }
        } else {
            toast.info('No changes to save');
        }
    }

    async function handleUserAvatarUpload(storageId: Id<"_storage">) {
        try {
            const response = await updateUserAvatar({
                storageId: storageId
            });

            if (response.success) {
                toast.success('Successfully updated user avatar');
            } else {
                toast.error('Failed to update user avatar');
            }
        } catch (error) {
            console.error('Error updating user avatar:', error);
            toast.error('An error occurred while updating the user avatar');
        }
    }

    async function handleDeleteUser() {
        if (confirmUserDelete === `DELETE ${session.data?.user?.email}`) {
            setIsUserDeleteDialogOpen(true);
        } else {
            toast.error(`Please type "DELETE ${session.data?.user?.email}" to confirm deletion`);
        }
    }

    async function confirmDeleteUser() {
        const response = await deleteUserMutation();
        if (response.success) {
            toast.success('User account deleted successfully');
            signout();
        } else {
            toast.error('Failed to delete user account', { description: response.message });
        }
    }

    function isAdmin() {
        return session.data?.user?.id === workspace?.ownerId
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center px-8 py-6">
                <h1 className="font-bold text-2xl">Settings</h1>
            </div>
            <Separator />
            <div className="flex flex-grow gap-4 px-8 py-4 overflow-hidden">
                <Tabs defaultValue={isAdmin() ? "workspaceGeneral" : "userGeneral"} orientation="horizontal" className="flex gap-6 w-full h-full">
                    <TabsList className="flex flex-col flex-shrink-0 justify-start items-start gap-1 bg-transparent p-4 w-1/5 h-full text-left">
                        {isAdmin() && (
                            <>
                                <p className="text-left text-muted-foreground text-sm">Workspace settings</p>
                                {workspaceSettingsItems.map((item) => (
                                    <TabsTrigger value={item.tabName} key={item.name} className="flex justify-start gap-2 hover:bg-muted data-[state=active]:bg-muted py-2 w-full data-[state=active]:shadomw-none font-normal text-left text-primary">
                                        <item.icon className="w-4 h-4" />
                                        {item.name}
                                    </TabsTrigger>
                                ))}
                                <Separator className="my-4" />
                            </>
                        )}
                        <p className="text-left text-muted-foreground text-sm">User settings</p>
                        {userSettingsItems.map((item) => (
                            <TabsTrigger value={item.tabName} key={item.name} className="flex justify-start gap-2 hover:bg-muted data-[state=active]:bg-muted py-2 w-full data-[state=active]:shadomw-none font-normal text-left text-primary">
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="flex-grow w-4/5 overflow-hidden">
                        <div className="pr-4 h-full overflow-y-auto">
                            <TabsContent value="workspaceGeneral" className="space-y-4">
                                {workspaceGeneralSettings.map((item, index) => (
                                    <SettingsCard key={index} {...item} />
                                ))}
                                <UploadCard
                                    title="Workspace Logo"
                                    description="Upload a logo for your workspace. Recommended size: 200x200px."
                                    acceptedFileTypes="image/*"
                                    onUploadComplete={handleLogoUpload}
                                />
                                <SettingsCard
                                    title="Delete Workspace"
                                    description={`Permanently delete this workspace and all of its data. This action cannot be undone. Type "DELETE ${workspace?.name}" to confirm.`}
                                    inputValue={confirmDelete}
                                    setInputValue={setConfirmDelete}
                                    onSave={handleDeleteWorkspace}
                                    isDangerous={true}
                                    buttonText="Delete Workspace"
                                />
                            </TabsContent>
                            <TabsContent value="workspaceUsers">
                                <UserSettingsCard users={workspaceUsers} workspace={workspace} invites={invites ?? []} />
                            </TabsContent>
                            <TabsContent value="workspaceBilling">
                                <h2 className="font-bold text-lg">Billing</h2>
                                <p>Manage the billing for your workspace here.</p>
                            </TabsContent>
                            <TabsContent value="userGeneral" className="space-y-4">
                                {userGeneralSettings.map((item, index) => (
                                    <SettingsCard key={index} {...item} />
                                ))}
                                <SelectCard
                                    title="Default Workspace"
                                    description="Select your default workspace. This workspace will be opened when you log in."
                                    options={workspaceOptions}
                                    selectedValue={defaultWorkspace}
                                    onValueChange={setDefaultWorkspace}
                                    onSave={handleEditUser}
                                />
                                <UploadCard
                                    title="Avatar"
                                    description="Upload your avatar. Recommended size: 200x200px."
                                    acceptedFileTypes="image/*"
                                    onUploadComplete={handleUserAvatarUpload}
                                />
                                <SettingsCard
                                    title="Delete Account"
                                    description={`Permanently delete this account and all of its data. This action cannot be undone. Type "DELETE ${session.data?.user?.email}" to confirm.`}
                                    inputValue={confirmUserDelete}
                                    setInputValue={setConfirmUserDelete}
                                    onSave={handleDeleteUser}
                                    isDangerous={true}
                                    buttonText="Delete Account"
                                />
                            </TabsContent>
                            <TabsContent value="userSecurity">
                                <h2 className="font-bold text-lg">User security</h2>
                                <p>Manage the billing for your workspace here.</p>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
            <ConfirmationDialog
                title="Are you absolutely sure?"
                description="This action cannot be undone. This will permanently delete your workspace and remove all associated data from our servers."
                confirmText="Delete Workspace"
                onConfirm={confirmDeleteWorkspace}
                isDangerous={true}
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            />
            <ConfirmationDialog
                title="Are you absolutely sure?"
                description="This action cannot be undone. This will permanently delete your account and remove all associated data from our servers."
                confirmText="Delete Account"
                onConfirm={confirmDeleteUser}
                isDangerous={true}
                isOpen={isUserDeleteDialogOpen}
                onOpenChange={setIsUserDeleteDialogOpen}
            />
        </div>
    );
}
