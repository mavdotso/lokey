'use client'
import { toast } from "sonner"
import { useParams, useSearchParams } from 'next/navigation'
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import React, { useState, useEffect, useRef } from 'react';
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { decryptData } from "@/lib/utils";

export default function SharePage() {

    const [credentialsData, setCredentialsData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showCredentials, setShowCredentials] = useState<{ [key: string]: boolean }>({});
    const [isCopied, setIsCopied] = useState<{ [key: string]: boolean }>({});

    const fetchAttempted = useRef(false)

    const { id } = useParams();
    const searchParams = useSearchParams();
    const publicKey = searchParams.get('publicKey') || '';

    const credentials = useQuery(api.credentials.retrieveCredentials, { _id: id as Id<"credentials">, publicKey: publicKey })
    const incrementCredentialsViewCount = useMutation(api.credentials.incrementCredentialsViewCount)

    useEffect(() => {
        async function fetchAndDecryptCredentials() {
            if (!id || !publicKey || fetchAttempted.current || !credentials) return

            fetchAttempted.current = true;

            try {
                setIsLoading(true);
                if (credentials.isExpired) {
                    setError('The credentials have expired and are no longer available.');
                } else if (credentials.encryptedData && credentials.privateKey) {
                    const decryptedData = decryptData(credentials.encryptedData, publicKey, credentials.privateKey);

                    const parsedData = JSON.parse(decryptedData)

                    await incrementCredentialsViewCount({ id: id as string })
                    setCredentialsData(parsedData);
                } else {
                    throw new Error('Failed to retrieve encrypted data');
                }
            } catch (err) {
                console.error('Error fetching credentials:', err);
                setError('Failed to decrypt credentials. This link may have expired or is invalid.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndDecryptCredentials();
    }, [id, publicKey, credentials, incrementCredentialsViewCount]);


    function copyToClipboard(key: string, value: string) {
        navigator.clipboard.writeText(value).then(() => {
            setIsCopied(prev => ({ ...prev, [key]: true }));
            toast.success("Credentials copied to clipboard");
            setTimeout(() => setIsCopied(prev => ({ ...prev, [key]: false })), 2000);
        });
    }

    function handleshowCredentials(key: string) {
        setShowCredentials(prev => ({ ...prev, [key]: !prev[key] }));
    }

    function renderFields(data: any) {
        if (typeof data !== 'object' || data === null) {
            return null;
        }

        return (
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="space-y-4">
                        <div>
                            <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                            <div className="relative">
                                <Input
                                    id={key}
                                    type={showCredentials[key] ? "text" : "password"}
                                    value={String(value || '')}
                                    readOnly
                                    className="pr-20 w-full"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="top-0 right-10 absolute h-full"
                                    onClick={() => handleshowCredentials(key)}
                                >
                                    {showCredentials[key] ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="top-0 right-0 absolute h-full"
                                    onClick={() => copyToClipboard(key, String(value))}
                                >
                                    {isCopied[key] ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }


    return (
        <>
            <div className="pt-10">
                <h2 className="pb-4 font-bold text-5xl">
                    Credentials have been securely shared with you
                </h2>
                <p className="text-lg text-muted-foreground">
                    These credentials will be deleted after you close this page. <br /> Make sure to copy and store them securely.
                </p>
            </div>

            <div className='flex flex-col pt-8'>
                {error ? (
                    <div className="text-destructive">{error}</div>
                ) : isLoading ? (
                    <div className="space-y-4">
                        <div>
                            <Label>Loading...</Label>
                            <Skeleton className="rounded-md w-full h-10" />
                        </div>
                    </div>
                ) : (
                    <>
                        {renderFields(credentialsData)}
                        <p className="py-4 max-w-md text-muted-foreground text-sm">
                            <span className="pr-2">⏳</span>
                            You can view these credentials only once. They will be deleted after you leave this page, so make sure to copy and store them in a secure place.
                        </p>
                    </>
                )}
            </div>
            <p className="pt-4 text-muted-foreground text-xs">
                Want to share your own credentials securely? <br />
                <a href="/sign-in" className="text-primary hover:underline">Create a free account</a> to get started.
            </p>
        </>
    );
}