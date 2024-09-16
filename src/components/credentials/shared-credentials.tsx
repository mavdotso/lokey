import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon, CopyIcon } from 'lucide-react';
import { decryptData } from '@/lib/utils';
import { toast } from 'sonner';

interface SharedCredentialsModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    credentials: {
        name: string;
        description?: string;
        type: string;
        encryptedData: string;
        publicKey: string;
        privateKey: string;
    };
}

export function SharedCredentialsModal({ isOpen, setIsOpen, credentials }: SharedCredentialsModalProps) {
    const [decryptedData, setDecryptedData] = useState<Record<string, string> | null>(null);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

    const handleDecrypt = () => {
        try {
            const decrypted = JSON.parse(decryptData(credentials.encryptedData, credentials.publicKey, credentials.privateKey));
            setDecryptedData(decrypted);
        } catch (error) {
            console.error('Failed to decrypt data:', error);
            toast.error('Failed to decrypt credentials');
        }
    };

    const togglePasswordVisibility = (field: string) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Copied to clipboard');
        }).catch(() => {
            toast.error('Failed to copy');
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{credentials.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {credentials.description && (
                        <p className="mb-4 text-muted-foreground text-sm">{credentials.description}</p>
                    )}
                    {!decryptedData ? (
                        <Button onClick={handleDecrypt}>Decrypt Credentials</Button>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(decryptedData).map(([key, value]) => (
                                <div key={key}>
                                    <Label htmlFor={key}>{key}</Label>
                                    <div className="flex items-center">
                                        <Input
                                            id={key}
                                            type={showPasswords[key] ? 'text' : 'password'}
                                            value={value}
                                            readOnly
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => togglePasswordVisibility(key)}
                                            className="ml-2"
                                        >
                                            {showPasswords[key] ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyToClipboard(value)}
                                            className="ml-2"
                                        >
                                            <CopyIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}