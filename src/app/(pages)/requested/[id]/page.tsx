"use client"
import { useState, useEffect, FormEvent } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingScreen } from '@/components/global/loading-screen';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';
import { crypto } from '@/lib/utils';
import { SubmitButton } from '@/components/global/submit-button';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { credentialsFields } from '@/lib/config/credentials-fields';
import { CREDENTIALS_TYPES } from '@/convex/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAction } from 'convex/nextjs';

export default function FillCredentialsRequestPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const encodedPublicKey = searchParams.get('publicKey');
    const publicKey = encodedPublicKey ? crypto.decodePublicKey(encodedPublicKey) : null;
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const credentialsRequest = useQuery(api.credentialsRequests.getCredentialsRequestById, {
        credentialsRequestId: id as Id<'credentialsRequests'>
    });


    useEffect(() => {
        if (credentialsRequest && credentialsRequest.credentials.length > 0) {
            const initialFormData = credentialsRequest.credentials.reduce((acc, cred) => {
                const credentialType = cred.type as keyof typeof CREDENTIALS_TYPES;
                const fields = credentialsFields[credentialType];
                fields.forEach(field => {
                    acc[`${cred.name}_${field.id}`] = '';
                });
                return acc;
            }, {} as Record<string, string>);
            setFormData(initialFormData);
        }
    }, [credentialsRequest]);

    if (credentialsRequest === undefined) return <LoadingScreen />;
    if (credentialsRequest === null) return <div>Credential request not found</div>;
    if (!publicKey) return <div>Invalid request: Missing secret key</div>;
    if (credentialsRequest.credentials.length === 0) return <div>Invalid request: No credentials specified</div>;

    const credentialType = credentialsRequest.credentials[0].type as keyof typeof CREDENTIALS_TYPES;
    const fields = credentialsFields[credentialType];

    function handleInputChange(fieldId: string, value: string) {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    async function handleSubmit(formData: FormData) {

        if (!publicKey || !credentialsRequest) {
            console.log('Missing public key or credentials request');
            toast.error('Invalid request: Missing required data');
            return;
        }

        const credentials = credentialsRequest.credentials.map((cred) => {
            const credentialType = cred.type as keyof typeof CREDENTIALS_TYPES;
            const fields = credentialsFields[credentialType];
            const value = fields.map(field => formData.get(`${cred.name}_${field.id}`)).join('\n');
            const encryptedValue = crypto.encryptWithPublicKey(value, publicKey);
            return {
                name: cred.name,
                type: cred.type,
                encryptedValue: encryptedValue
            };
        });

        const validCredentials = credentials.filter((cred): cred is NonNullable<typeof cred> => cred !== null);

        if (validCredentials.length !== credentialsRequest.credentials.length) {
            toast.error('Please fill in all credential fields');
            return;
        }

        try {
            const result = await fetchAction(api.credentialsRequests.fulfillCredentialsRequest, {
                credentialsRequestId: credentialsRequest._id,
                fulfilledCredentials: credentials,
            });

            if (result.success) {
                setIsSubmitted(true);
            } else {
                toast.error('Failed to submit credentials');
            }
        } catch (error) {
            console.error('Error submitting credentials:', error);
            toast.error('An error occurred while submitting credentials');
        }
    };

    if (isSubmitted) {
        return (
            <>
                <div className="pt-20">
                    <h1 className="pb-4 font-bold text-5xl">
                        Credentials Submitted
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        You have successfully submitted the requested credentials.
                    </p>
                </div>

                <div className='flex flex-col pt-8 max-w-xl'>
                    <div className="space-y-4">
                        <div className="flex items-center bg-muted p-6 rounded-md">
                            <CheckCircleIcon className="mr-4 w-12 h-12 text-primary" />
                            <div>
                                <h2 className="font-semibold text-xl">Credentials Submitted Successfully</h2>
                                <p className="text-muted-foreground">The credentials have been securely encrypted and sent.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Link href="/">
                            <Button>Back to Home</Button>
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="pt-20">
                <h1 className="pb-4 font-bold text-5xl">
                    Provide Requested Credentials
                </h1>
                <p className="text-lg text-muted-foreground">
                    Please fill in the requested information below.
                </p>
            </div>

            <div className='py-8 w-full'>
                <form action={handleSubmit} className="space-y-8">
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        {credentialsRequest.credentials.map((cred, index) => {
                            const credentialType = cred.type as keyof typeof CREDENTIALS_TYPES;
                            const fields = credentialsFields[credentialType];
                            return (
                                <Card key={index}>
                                    <CardHeader>
                                        <CardTitle className="mb-4 font-semibold text-2xl">{cred.name}</CardTitle>
                                        {cred.description && (
                                            <CardDescription className="mb-4 text-muted-foreground">{cred.description}</CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {fields.map((field) => (
                                            <div key={field.id}>
                                                <Label htmlFor={`${cred.name}_${field.id}`}>{field.label}</Label>
                                                <Input
                                                    type={field.type === 'password' ? 'password' : 'text'}
                                                    id={`${cred.name}_${field.id}`}
                                                    name={`${cred.name}_${field.id}`}
                                                    value={formData[`${cred.name}_${field.id}`] || ''}
                                                    onChange={(e) => handleInputChange(`${cred.name}_${field.id}`, e.target.value)}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    <SubmitButton text='Submit Credentials' pendingText='Submitting...' />
                </form>
            </div>
        </div>
    );
}