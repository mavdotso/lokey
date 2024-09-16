import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon, CopyIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SharedCredentialsModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    credentials: {
        name: string;
        description?: string;
        type: string;
        value: string;
    };
}

export function SharedCredentialsModal({ isOpen, setIsOpen, credentials }: SharedCredentialsModalProps) {
    const [showPassword, setShowPassword] = useState(false);

    function togglePasswordVisibility() {
        setShowPassword(!showPassword);
    };

    function copyToClipboard(text: string) {
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
                    <DialogDescription>{credentials.description}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="credentialValue">{credentials.name}</Label>
                            <div className="flex items-center">
                                <Input
                                    id="credentialValue"
                                    type={showPassword ? 'text' : 'password'}
                                    value={credentials.value}
                                    readOnly
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={togglePasswordVisibility}
                                    className="ml-2"
                                >
                                    {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(credentials.value)}
                                    className="ml-2"
                                >
                                    <CopyIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}