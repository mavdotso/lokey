"use client"
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash, Plus } from "lucide-react";
import { RoleType, Workspace } from "@/convex/types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getURL } from "@/lib/utils";
import { addDays } from 'date-fns';

interface InviteEmailDialogProps {
    workspace: Workspace;
}

type InvitableRoleType = Exclude<RoleType, "ADMIN">;

export function InviteEmailDialog({ workspace }: InviteEmailDialogProps) {
    const [emails, setEmails] = useState([{ id: 1, value: '', role: 'MEMBER' as InvitableRoleType }]);
    const createInvite = useMutation(api.invites.createInvite);
    const [isLoading, setIsLoading] = useState(false);
    const baseUrl = getURL();

    function addEmailField() {
        const newId = emails.length > 0 ? Math.max(...emails.map(e => e.id)) + 1 : 1;
        setEmails([...emails, { id: newId, value: '', role: 'MEMBER' }]);
    };

    function removeEmailField(id: number) {
        setEmails(emails.filter(email => email.id !== id));
    };

    function handleEmailChange(id: number, value: string) {
        setEmails(emails.map(email => email.id === id ? { ...email, value } : email));
    };

    function handleRoleChange(id: number, role: InvitableRoleType) {
        setEmails(emails.map(email => email.id === id ? { ...email, role } : email));
    };

    async function handleSendInvites() {
        if (!workspace || !workspace._id) {
            toast.error("Invalid workspace");
            return;
        }

        setIsLoading(true);
        const validEmails = emails.filter(email => email.value.trim());

        try {
            const invitePromises = validEmails.map(async (email) => {
                const expiresAt = addDays(new Date(), 5).toISOString();

                const result = await createInvite({
                    workspaceId: workspace._id!,
                    invitedEmail: email.value.trim(),
                    role: email.role,
                    expiresAt: expiresAt,
                });

                if (result.success && result.data) {
                    return {
                        to: email.value.trim(),
                        invitedByUsername: 'A team member',
                        workspaceName: workspace?.name || 'Your Workspace',
                        inviteLink: `${baseUrl}/invite/${result.data.inviteCode}`,
                        role: email.role,
                    };
                } else {
                    toast.error(`Failed to create invite for ${email.value}`);
                }
            });

            const invites = await Promise.all(invitePromises);

            for (const invite of invites) {
                if (invite) {
                    const response = await fetch('/api/emails/invite', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(invite),
                    });

                    if (!response.ok) {
                        toast.error(`Failed to send invitation to ${invite.to}`);
                    }
                }
            }

            toast.success("Invitations sent", {
                description: `Invitations have been sent to ${validEmails.length} email${validEmails.length > 1 ? 's' : ''}.`,
            });

            setEmails([{ id: 1, value: '', role: 'member' as InvitableRoleType }]);
        } catch (error) {
            console.error('Error sending invitations:', error);
            toast.error("Failed to send invitations", {
                description: "An error occurred while sending the invitations. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    Invite teammates
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Invite people</DialogTitle>
                    <DialogDescription>
                        Invite teammates to join your workspace. Invitations are valid for 5 days.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 py-2">
                    <Label htmlFor="emails">Email addresses</Label>
                    {emails.map((email, index) => (
                        <div key={email.id} className="flex items-center space-x-2">
                            <Input
                                id={index === 0 ? "emails" : `email-${email.id}`}
                                placeholder="user@acme.inc"
                                type="email"
                                value={email.value}
                                onChange={(e) => handleEmailChange(email.id, e.target.value)}
                            />
                            <Select value={email.role} onValueChange={(value: InvitableRoleType) => handleRoleChange(email.id, value)}>
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeEmailField(email.id)}
                                disabled={emails.length === 1}
                            >
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" className="flex gap-2 w-fit" onClick={addEmailField}>
                        <Plus className="w-4 h-4" /> Add email
                    </Button>
                </div>
                <DialogFooter className="sm:justify-between py-2">
                    <Button
                        type="button"
                        size={"lg"}
                        className="w-full"
                        onClick={handleSendInvites}
                        disabled={isLoading || emails.every(email => !email.value.trim())}
                    >
                        {isLoading ? 'Sending...' : 'Send invites'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}