"use client"
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SettingsCard, SettingsCardProps } from "@/components/dashboard/settings/settings-card";
import { UploadCard } from "@/components/dashboard/settings/upload-card";
import { SelectCard } from "@/components/dashboard/settings/select-card";
import { ConfirmationDialog } from "@/components/global/confirmation-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { User, Workspace } from "@/convex/types";
import { signout } from "@/lib/server-actions";

export function SettingsForm({
    workspace,
    user,
    userWorkspaces
}: {
    workspace: Workspace;
    user: Partial<User>;
    userWorkspaces: Workspace[] | undefined;
}) {
    const router = useRouter();

    const [workspaceName, setWorkspaceName] = useState(workspace.name);
    const [workspaceSlug, setWorkspaceSlug] = useState(workspace.slug);
    const [confirmDelete, setConfirmDelete] = useState('');

    const [userName, setUserName] = useState(user.name || '');
    const [defaultWorkspace, setDefaultWorkspace] = useState(user.defaultWorkspace || '');
    const [confirmUserDelete, setConfirmUserDelete] = useState('');

    const [confirmationDialogProps, setConfirmationDialogProps] = useState({
        isOpen: false,
        title: "",
        description: "",
        confirmText: "",
        onConfirm: () => { },
    });

    const editWorkspace = useMutation(api.workspaces.editWorkspace);
    const updateWorkspaceLogo = useMutation(api.workspaces.updateWorkspaceLogo);
    const deleteWorkspaceMutation = useMutation(api.workspaces.deleteWorkspace);

    const editUser = useMutation(api.users.editUser);
    const updateUserAvatar = useMutation(api.users.updateUserAvatar);
    const deleteUserMutation = useMutation(api.users.deleteUser);

    const workspaceGeneralSettings: SettingsCardProps[] = [
        { title: 'Workspace name', description: 'This is the name of your workspace on Lokey.', inputValue: workspaceName, setInputValue: setWorkspaceName, inputPlaceholder: workspaceName, isInputRequired: false, onSave: handleEdit, },
        { title: 'Workspace slug', description: 'This is the slug of your workspace on Lokey.', inputValue: workspaceSlug, setInputValue: setWorkspaceSlug, inputPlaceholder: workspaceSlug, isInputRequired: false, onSave: handleEdit, },
    ];

    const userGeneralSettings: SettingsCardProps[] = [
        { title: 'Name', description: 'This is the name of your account on Lokey.', inputValue: userName, setInputValue: setUserName, inputPlaceholder: userName, isInputRequired: false, onSave: handleEditUser, },
    ];

    const workspaceOptions = userWorkspaces?.map(workspace => ({
        value: workspace._id,
        label: workspace.name
    })) || [];

    async function handleEdit() {
        const response = await editWorkspace({
            _id: workspace._id, updates: {
                name: workspaceName,
                slug: workspaceSlug
            }
        });

        if (response.success) {
            toast.success('Successfully updated the workspace')
            if (workspaceSlug !== workspace.slug) {
                router.push('/dashboard/' + workspaceSlug + '/settings')
            }
        } else {
            toast.error('Something went wrong', { description: response.message })
        }
    }

    async function handleLogoUpload(storageId: Id<"_storage">) {
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

    async function handleDeleteWorkspace() {
        if (confirmDelete === `DELETE ${workspace.name}`) {
            setConfirmationDialogProps({
                isOpen: true,
                title: "Are you absolutely sure?",
                description: "This action cannot be undone. This will permanently delete your workspace and remove all associated data from our servers.",
                confirmText: "Delete Workspace",
                onConfirm: confirmDeleteWorkspace,
            });
        } else {
            toast.error(`Please type "DELETE ${workspace.name}" to confirm deletion`);
        }
    }

    async function confirmDeleteWorkspace() {
        const response = await deleteWorkspaceMutation({ _id: workspace._id });
        if (response.success) {
            toast.success('Workspace deleted successfully');
            router.push('/dashboard');
        } else {
            toast.error('Failed to delete workspace', { description: response.message });
        }
    }

    async function handleEditUser() {
        const updates: {
            name?: string;
            defaultWorkspace?: Id<"workspaces"> | undefined;
        } = {};

        if (userName !== user.name) {
            updates.name = userName;
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
        if (confirmUserDelete === `DELETE ${user.email}`) {
            setConfirmationDialogProps({
                isOpen: true,
                title: "Are you absolutely sure?",
                description: "This action cannot be undone. This will permanently delete your account and remove all associated data from our servers.",
                confirmText: "Delete Account",
                onConfirm: confirmDeleteUser,
            });
        } else {
            toast.error(`Please type "DELETE ${user.email}" to confirm deletion`);
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

    return (
        <>
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
                description={`Permanently delete this workspace and all of its data. This action cannot be undone. Type "DELETE ${workspace.name}" to confirm.`}
                inputValue={confirmDelete}
                setInputValue={setConfirmDelete}
                onSave={handleDeleteWorkspace}
                isDangerous={true}
                buttonText="Delete Workspace"
            />
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
                description={`Permanently delete this account and all of its data. This action cannot be undone. Type "DELETE ${user.email}" to confirm.`}
                inputValue={confirmUserDelete}
                setInputValue={setConfirmUserDelete}
                onSave={handleDeleteUser}
                isDangerous={true}
                buttonText="Delete Account"
            />
            <ConfirmationDialog
                title={confirmationDialogProps.title}
                description={confirmationDialogProps.description}
                confirmText={confirmationDialogProps.confirmText}
                onConfirm={confirmationDialogProps.onConfirm}
                isDangerous={true}
                isOpen={confirmationDialogProps.isOpen}
                onOpenChange={(isOpen) => setConfirmationDialogProps(prev => ({ ...prev, isOpen }))}
            />
        </>
    );
}