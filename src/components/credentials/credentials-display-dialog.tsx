import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon, CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DecryptedCredential } from '@/components/credentials/requested/requested-credentials-card';

interface CredentialsDisplayDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    decryptedCredentials: DecryptedCredential[];
}

export function CredentialsDisplayDialog({ isOpen, setIsOpen, decryptedCredentials }: CredentialsDisplayDialogProps) {
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

    function togglePasswordVisibility(name: string) {
        setShowPasswords(prev => ({ ...prev, [name]: !prev[name] }));
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Copied to clipboard');
        }).catch(() => {
            toast.error('Failed to copy');
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Decrypted Credentials</DialogTitle>
                    <DialogDescription>
                        Here are all the decrypted credentials for this request.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {decryptedCredentials.map((cred, index) => (
                        <div key={index} className="space-y-2">
                            <Label htmlFor={`credential-${index}`}>{cred.name}</Label>
                            <div className="flex items-center">
                                <Input
                                    id={`credential-${index}`}
                                    type={showPasswords[cred.name] ? 'text' : 'password'}
                                    value={cred.value}
                                    readOnly
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => togglePasswordVisibility(cred.name)}
                                    className="ml-2"
                                >
                                    {showPasswords[cred.name] ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(cred.value)}
                                    className="ml-2"
                                >
                                    <CopyIcon className="w-4 h-4" />
                                </Button>
                            </div>
                            {cred.description && (
                                <p className="text-muted-foreground text-sm">{cred.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}