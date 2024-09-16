"use client"
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingScreen } from '@/components/global/loading-screen';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';
import { crypto } from '@/lib/utils';

export default function FillCredentialsRequestPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const publicKey = searchParams.get('publicKey');
    const [formData, setFormData] = useState<Record<string, string>>({});

    const credentialsRequest = useQuery(api.credentials.getCredentialsRequestById, {
        _id: id as Id<'credentialsRequests'>
    });

    const fulfillCredentialsRequest = useMutation(api.credentials.fulfillCredentialsRequest);

    useEffect(() => {
        if (credentialsRequest) {
            const initialFormData = credentialsRequest.credentials.reduce((acc, field) => {
                acc[field.name] = '';
                return acc;
            }, {} as Record<string, string>);
            setFormData(initialFormData);
        }
    }, [credentialsRequest]);

    if (credentialsRequest === undefined) return <LoadingScreen />;
    if (credentialsRequest === null) return <div>Credential request not found</div>;
    if (!publicKey) return <div>Invalid request: Missing public key</div>;

    function handleInputChange(fieldName: string, value: string) {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!credentialsRequest || !publicKey) {
            toast.info("Credentials request not found");
            return;
        }

        try {
            const fulfilledCredentials = credentialsRequest.credentials.map(cred => {
                const encryptedValue = crypto.encrypt(formData[cred.name], publicKey);
                return {
                    name: cred.name,
                    type: cred.type,
                    encryptedValue,
                };
            });

            await fulfillCredentialsRequest({
                requestId: credentialsRequest._id,
                fulfilledCredentials,
            });

            toast.success('Credential request fulfilled successfully');
        } catch (error) {
            toast.error('Failed to fulfill credential request');
            console.error('Error:', error);
        }
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

            <div className='flex flex-col gap-4 pt-8 max-w-xl'>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {credentialsRequest.credentials.map((field, index) => (
                        <div key={index}>
                            <Label htmlFor={field.name}>{field.name}</Label>
                            {field.description && (
                                <p className="mb-2 text-muted-foreground text-sm">{field.description}</p>
                            )}
                            {field.type.toLowerCase().includes('password') ? (
                                <Input
                                    type="password"
                                    id={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                    required
                                />
                            ) : field.type.toLowerCase().includes('description') ? (
                                <Textarea
                                    id={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                    required
                                />
                            ) : (
                                <Input
                                    type="text"
                                    id={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                    required
                                />
                            )}
                        </div>
                    ))}
                    <Button type="submit">Submit Credentials</Button>
                </form>
            </div>
        </div>
    );
}