"use client"
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SettingsCard, SettingsCardProps } from "@/components/dashboard/settings/settings-card";
import { UploadCard } from "@/components/dashboard/settings/upload-card";
import { ConfirmationDialog } from "@/components/global/confirmation-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { Workspace } from "@/convex/types";
import { fetchAction, fetchMutation } from "convex/nextjs";
import { useSession } from "next-auth/react";

export function WorkspaceSettings({ workspace }: { workspace: Workspace }) {
    const router = useRouter();
    const session = useSession();

    const [workspaceName, setWorkspaceName] = useState(workspace.name);
    const [workspaceSlug, setWorkspaceSlug] = useState(workspace.slug);
    const [confirmDelete, setConfirmDelete] = useState('');

    const [confirmationDialogProps, setConfirmationDialogProps] = useState({
        isOpen: false,
        title: "",
        description: "",
        confirmText: "",
        onConfirm: () => { },
    });

    const workspaceGeneralSettings: SettingsCardProps[] = [
        { title: 'Workspace name', description: 'This is the name of your workspace on Lokey.', inputValue: workspaceName, setInputValue: setWorkspaceName, inputPlaceholder: workspaceName, isInputRequired: false, onSave: handleEdit, },
        { title: 'Workspace slug', description: 'This is the slug of your workspace on Lokey.', inputValue: workspaceSlug, setInputValue: setWorkspaceSlug, inputPlaceholder: workspaceSlug, isInputRequired: false, onSave: handleEdit, },
    ];

    async function handleEdit() {
        if (!workspace._id) return;

        const response = await fetchAction(api.workspaces.editWorkspace, {
            workspaceId: workspace._id,
            adminId: session.data?.user?.id as Id<"users">,
            updates: {
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
        if (!workspace._id) return;
        try {
            const response = await fetchMutation(api.workspaces.updateWorkspaceLogo, {
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
        if (!workspace._id) return;

        const response = await fetchMutation(api.workspaces.deleteWorkspace, { _id: workspace._id });
        if (response.success) {
            toast.success('Workspace deleted successfully');
            router.push('/dashboard');
        } else {
            toast.error('Failed to delete workspace', { description: response.message });
        }
    }

    return (
        <div className="flex flex-col gap-4">
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