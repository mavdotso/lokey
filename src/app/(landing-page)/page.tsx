'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useMutation } from 'convex/react';
import { getURL } from '@/lib/utils';
import { api } from '../../../convex/_generated/api';

export default function LandingPage() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [expiration, setExpiration] = useState('1');
    const [link, setLink] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const createCredential = useMutation(api.mutations.createCredential);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setLink('');

        try {
            const { credentialId } = await createCredential({
                name: 'Shared Password',
                description: 'One-time shared password',
                type: 'password',
                data: password,
                expiresAt: new Date(Date.now() + parseInt(expiration) * 24 * 60 * 60 * 1000).toISOString(),
                maxViews: 1
            });

            const shareLink = `${getURL()}/shared/${credentialId}`;
            setLink(shareLink);
        } catch (err) {
            setError('An error occurred while creating the link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    function handleCopyLink() {
        navigator.clipboard.writeText(link);
        setIsCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <>
            <div className="pt-12">
                <h1 className="pb-4 font-bold text-5xl">
                    Secure Password Sharing <br /> With Superpowers
                </h1>
                <p className="text-lg text-muted-foreground">
                    Share passwords securely with one-time links that expire after use.
                </p>
            </div>

            <div className='flex flex-col pt-8 max-w-xl'>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            <Button type="submit" size={"lg"} disabled={isLoading}>
                                {isLoading ? 'Generating...' : 'Share password'}
                            </Button>
                        </div>
                    </div>
                </form>

                {link && (
                    <div className="space-y-4 pt-6">
                        <div className="flex items-center bg-muted p-3 rounded-md">
                            <ScrollArea className="rounded-md w-full whitespace-nowrap">
                                <div className="font-medium text-muted-foreground text-sm">{link}</div>
                                <ScrollBar orientation="horizontal" className="pt-2" />
                            </ScrollArea>
                            <Button size="sm" variant="outline" onClick={handleCopyLink}>
                                {isCopied ? (
                                    <>
                                        <CheckIcon className="pr-2 w-4 h-4" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <CopyIcon className="pr-2 w-4 h-4" />
                                        Copy Link
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            <span className="pr-2">⏳</span>
                            One-time use link
                        </p>
                    </div>
                )}

                {error && <p className="mt-4 text-destructive text-sm">{error}</p>}
            </div>
            <p className="pt-4 text-muted-foreground text-xs">
                Want to manage your shared passwords or view their usage? <br />
                <a href="#" className="text-primary hover:underline">Create a free account</a> to get started.
            </p>
        </>
    );
}