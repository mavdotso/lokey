'use client'
import { toast } from "sonner"
import { useParams } from 'next/navigation'
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import React, { useState, useEffect, useRef } from 'react';
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

export default function SharePage() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const params = useParams()
    const id = params.id as string
    const fetchAttempted = useRef(false)

    useEffect(() => {
        const fetchPassword = async () => {
            if (!id || fetchAttempted.current) return;
            fetchAttempted.current = true;

            try {
                const response = await fetch(`/api/get-credentials/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch password');
                }
                const data = await response.json();
                setPassword(data.password);
            } catch (err) {
                setError('This link has expired or is invalid.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPassword();
    }, [id]);

    function copyToClipboard() {
        navigator.clipboard.writeText(password).then(() => {
            setIsCopied(true);
            toast.success("Password copied to clipboard");
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <>
            <div className="pt-10">
                <h2 className="pb-4 font-bold text-5xl">
                    A password has been securely shared with you
                </h2>
                <p className="text-lg text-muted-foreground">
                    This password will be deleted after you close this page. <br /> Make sure to copy and store it securely.
                </p>
            </div>

            <div className='flex flex-col pt-8 max-w-md'>
                {error ? (
                    <div className="text-destructive">{error}</div>
                ) : isLoading ? (
                    <div className="space-y-4">
                        <div>
                            <Label>Shared Password</Label>
                            <Skeleton className="rounded-md w-full h-10" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div>
                                <Label>Shared Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        readOnly
                                        className="pr-20 w-full"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="top-0 right-10 absolute h-full"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="top-0 right-0 absolute h-full"
                                        onClick={copyToClipboard}
                                    >
                                        {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <p className="py-4 text-muted-foreground text-sm">
                            <span className="pr-2">⏳</span>
                            This is a one-time use password. <br />It will be deleted after you close this page.
                        </p>
                    </>
                )}
            </div>
            <p className="pt-4 text-muted-foreground text-xs">
                Want to share your own passwords securely? <br />
                <a href="/" className="text-primary hover:underline">Create a free account</a> to get started.
            </p>
        </>
    );
}