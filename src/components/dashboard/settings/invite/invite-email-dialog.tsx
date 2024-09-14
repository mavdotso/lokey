import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash, Plus } from "lucide-react";
import { RoleType } from "@/convex/types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface InviteEmailDialogProps {
    workspaceId: Id<"workspaces">;
}

type InvitableRoleType = Exclude<RoleType, "admin">;

export function InviteEmailDialog({ workspaceId }: InviteEmailDialogProps) {
    const [emails, setEmails] = useState([{ id: 1, value: '', role: 'member' as InvitableRoleType }]);
    const createInvite = useMutation(api.invites.createInvite);

    function addEmailField() {
        const newId = emails.length > 0 ? Math.max(...emails.map(e => e.id)) + 1 : 1;
        setEmails([...emails, { id: newId, value: '', role: 'member' }]);
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
        for (const email of emails) {
            if (email.value) {
                try {
                    await createInvite({
                        workspaceId,
                        invitedEmail: email.value,
                        role: email.role,
                    });
                    toast.success("Invitation sent", {
                        description: `An invitation has been sent to ${email.value}`,
                    });
                } catch (error) {
                    toast.error(`Failed to send invitation to ${email.value}`);
                }
            }
        }
        // Reset the form after sending invites
        setEmails([{ id: 1, value: '', role: 'member' as InvitableRoleType }]);
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
                        Invite teammates to join your workspace. Invitations will be valid for 14 days.
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
                    <Button type="button" size={"lg"} className="w-full" onClick={handleSendInvites}>
                        Send invites
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}