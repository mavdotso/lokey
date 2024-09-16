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
    const secretKey = searchParams.get('secretKey');
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
    if (!secretKey) return <div>Invalid request: Missing secret key</div>;

    function handleInputChange(fieldName: string, value: string) {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();


        if (!secretKey) {
            console.log('Missing public key');
            toast.error('Invalid request: Missing public key');
            return;
        }

        console.log('Secret key:', secretKey);

        const formData = new FormData(event.currentTarget);
        const credentials = credentialsRequest.credentials.map((cred) => {
            const value = formData.get(cred.name) as string;
            console.log(`Form value for ${cred.name}:`, value);

            if (!value) {
                console.error(`Missing value for ${cred.name}`);
                return null;
            }

            console.log(`Encrypting value for ${cred.name}:`, value);
            const encryptedValue = crypto.encrypt(value, secretKey);
            console.log(`Encrypted value for ${cred.name}:`, encryptedValue);
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

        console.log('Sending credentials to server:', validCredentials);

        try {
            const result = await fulfillCredentialsRequest({
                requestId: credentialsRequest._id,
                fulfilledCredentials: validCredentials
            });

            console.log('Server response:', result);

            if (result.success) {
                toast.success('Credentials submitted successfully');
                // Handle successful submission (e.g., redirect or update UI)
            } else {
                toast.error('Failed to submit credentials');
            }
        } catch (error) {
            console.error('Error submitting credentials:', error);
            toast.error('An error occurred while submitting credentials');
        }
    };

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
                                    name={field.name}
                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                    required
                                />
                            ) : field.type.toLowerCase().includes('description') ? (
                                <Textarea
                                    id={field.name}
                                    value={formData[field.name] || ''}
                                    name={field.name}
                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                    required
                                />
                            ) : (
                                <Input
                                    type="text"
                                    id={field.name}
                                    name={field.name}
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