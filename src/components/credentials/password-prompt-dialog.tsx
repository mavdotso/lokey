import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PasswordPromptDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    handleViewCredentials: (secretPhrase: string) => Promise<void>;
}

export function PasswordPromptDialog({ isOpen, setIsOpen, handleViewCredentials }: PasswordPromptDialogProps) {
    const [secretPhrase, setSecretPhrase] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await handleViewCredentials(secretPhrase);
            setIsOpen(false);
            setSecretPhrase('');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to decrypt credentials. Please check your secret phrase.');
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Enter Secret Phrase</DialogTitle>
                    <DialogDescription>
                        Please enter the secret phrase to view the credentials.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="secretPhrase">Secret Phrase</Label>
                        <Input
                            id="secretPhrase"
                            type="password"
                            value={secretPhrase}
                            onChange={(e) => setSecretPhrase(e.target.value)}
                        />
                    </div>
                    <Button type="submit">View Credentials</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}