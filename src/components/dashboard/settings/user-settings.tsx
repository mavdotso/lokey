"use client"
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { SettingsCard, SettingsCardProps } from "@/components/dashboard/settings/settings-card";
import { UploadCard } from "@/components/dashboard/settings/upload-card";
import { SelectCard } from "@/components/dashboard/settings/select-card";
import { ConfirmationDialog } from "@/components/global/confirmation-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { User, Workspace } from "@/convex/types";
import { signout } from "@/lib/server-actions";
import { fetchAction, fetchMutation } from "convex/nextjs";

interface UserSettingsProps {
    user: Partial<User>,
    userWorkspaces: Workspace[]
}

export function UserSettings({ user, userWorkspaces }: UserSettingsProps) {
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

    const userGeneralSettings: SettingsCardProps[] = [
        { title: 'Name', description: 'This is the name of your account on Lokey.', inputValue: userName, setInputValue: setUserName, inputPlaceholder: userName, isInputRequired: false, onSave: handleEditUser, },
    ];

    const workspaceOptions = userWorkspaces
        ?.filter(workspace => workspace._id !== undefined)
        .map(workspace => ({
            value: workspace._id!.toString(),
            label: workspace.name
        })) || [];

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
            const response = await fetchMutation(api.users.editUser, { updates });

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
            const response = await fetchMutation(api.users.updateUserAvatar, {
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
        const response = await fetchAction(api.users.deleteUser, { userId: user._id as Id<"users"> });
        if (response.success) {
            toast.success('User account deleted successfully');
            signout();
        } else {
            toast.error('Failed to delete user account', { description: response.message });
        }
    }

    return (
        <div className="flex flex-col gap-4">
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
        </div>
    );
}