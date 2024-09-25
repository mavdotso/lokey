import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon, CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { CredentialsType } from '@/convex/types';
import { CredentialsField, credentialsFields } from '@/lib/config/credentials-fields';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface DecryptedCredential {
    name: string;
    type: CredentialsType;
    description: string | undefined;
    value: string;
}

interface CredentialsDisplayDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    decryptedCredentials: DecryptedCredential[];
}

export function CredentialsDisplayDialog({ isOpen, setIsOpen, decryptedCredentials }: CredentialsDisplayDialogProps) {
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

    console.log(decryptedCredentials)

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

    function parseCredentialValue(value: string, type: CredentialsType): { [key: string]: string } {
        const fields = credentialsFields[type];
        const values = value.split('\n');
        return fields.reduce((acc, field, index) => {
            acc[field.id] = values[index] || '';
            return acc;
        }, {} as { [key: string]: string });
    }

    function renderCredentialField(cred: DecryptedCredential, field: CredentialsField, parsedValue: { [key: string]: string }, index: number) {
        return (
            <div key={field.id} className="flex-1 space-y-2">
                <Label htmlFor={`credential-${index}-${field.id}`}>{field.label}</Label>
                <div className="relative">
                    <Input
                        id={`credential-${index}-${field.id}`}
                        type={showPasswords[`${cred.name}-${field.id}`] ? 'text' : field.type}
                        value={parsedValue[field.id]}
                        readOnly
                        className="pr-20"
                    />
                    <div className="right-0 absolute inset-y-0 flex items-center space-x-1 pr-3">
                        {field.type === 'password' && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => togglePasswordVisibility(`${cred.name}-${field.id}`)}
                                className="w-8 h-8"
                            >
                                {showPasswords[`${cred.name}-${field.id}`] ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(parsedValue[field.id])}
                            className="w-8 h-8"
                        >
                            <CopyIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
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
                <div className="space-y-4 bg-muted p-4 rounded-md max-h-[60vh] overflow-y-auto">
                    {decryptedCredentials.map((cred, index) => {
                        const parsedValue = parseCredentialValue(cred.value, cred.type);
                        const fields = credentialsFields[cred.type];
                        return (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="font-semibold">{cred.name}</CardTitle>
                                    {cred.description && (
                                        <CardDescription className="text-muted-foreground text-sm">{cred.description}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {fields.length === 2 ? (
                                        <div className="flex space-x-4">
                                            {fields.map(field => renderCredentialField(cred, field, parsedValue, index))}
                                        </div>
                                    ) : (
                                        fields.map(field => renderCredentialField(cred, field, parsedValue, index))
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}