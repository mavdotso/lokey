'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useMutation } from 'convex/react';
import { encryptData, generateShareLink } from '@/lib/utils';
import { api } from '@/convex/_generated/api';
import { CopyCredentialsLink } from '@/components/credentials/copy-credentials-link';
import { SubmitButton } from '@/components/global/submit-button';

export default function LandingPage() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [expiration, setExpiration] = useState('1');
    const [link, setLink] = useState('');
    const [error, setError] = useState('');

    const createCredentials = useMutation(api.credentials.createCredentials);

    async function handleSubmit() {
        setError('');
        setLink('');

        try {
            const { publicKey, privateKey, encryptedData } = encryptData(JSON.stringify({ password: password }))

            const { credentialsId } = await createCredentials({
                name: 'Shared Password',
                description: 'One-time shared password',
                type: 'PASSWORD',
                encryptedData: encryptedData,
                privateKey: privateKey,
                expiresAt: new Date(Date.now() + parseInt(expiration) * 24 * 60 * 60 * 1000).toISOString(),
                maxViews: 1
            });

            const shareLink = generateShareLink(credentialsId, publicKey);
            setLink(shareLink);
        } catch (err) {
            setError('An error occurred while creating the link. Please try again.');
        }
    }

    return (
        <>
            <div className="pt-20">
                <h1 className="pb-4 font-bold text-5xl">
                    Secure Password Sharing <br /> With Superpowers
                </h1>
                <p className="text-lg text-muted-foreground">
                    Share passwords securely with one-time links that expire after use.
                </p>
            </div>

            <div className='flex flex-col gap-4 pt-8 max-w-xl'>
                <form action={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-grow">
                            <Label>Password to share</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password to share"
                                    className="pr-10 w-full"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="top-0 right-0 absolute h-full group"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOffIcon className="group-hover:text-primary w-4 h-4 text-muted-foreground" /> : <EyeIcon className="group-hover:text-primary w-4 h-4 text-muted-foreground" />}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label>Link expiration</Label>
                            <Select value={expiration} onValueChange={setExpiration}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Expiration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 day</SelectItem>
                                    <SelectItem value="3">3 days</SelectItem>
                                    <SelectItem value="7">7 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <SubmitButton text='Share password' pendingText='Generating...' />
                        </div>
                    </div>
                </form>

                {link && (
                    <CopyCredentialsLink credentialsLink={link} />
                )}

                {error && <p className="mt-4 text-destructive text-sm">{error}</p>}
            </div>
            <p className="pt-4 text-muted-foreground text-xs">
                Want to manage your shared passwords or view their usage? <br />
                <a href="/sign-in" className="text-primary hover:underline">Create a free account</a> to get started.
            </p>
        </>
    );
}