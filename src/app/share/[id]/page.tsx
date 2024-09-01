'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation'
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ClipboardIcon } from '@radix-ui/react-icons';
import { toast } from "sonner"

export default function SharePage() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(true);
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
            setShowPassword(false);
            toast.success("Password copied to clipboard");
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center bg-gray-100 min-h-screen">
                <div className="font-semibold text-2xl text-gray-800">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center bg-gray-100 min-h-screen">
            <div className="bg-white shadow-md p-8 rounded-lg w-full max-w-md">
                <h1 className="mb-6 font-bold text-2xl text-center text-gray-800">Shared Password</h1>
                {error ? (
                    <div className="text-center text-red-600">{error}</div>
                ) : (
                    <>
                        <div className="mb-4">
                            <Label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
                                Password:
                            </Label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    id="password"
                                    value={showPassword ? password : '********'}
                                    readOnly
                                    className="border-gray-300 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full focus:outline-none pr-10"
                                />
                                {showPassword && (
                                    <button
                                        onClick={copyToClipboard}
                                        className="top-1/2 right-2 absolute text-gray-500 hover:text-gray-700 transform -translate-y-1/2"
                                        title="Copy to clipboard"
                                    >
                                        <ClipboardIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="mt-4 text-gray-600 text-sm">
                            {showPassword
                                ? "This password was shared securely with you. Click the copy icon to save it to your clipboard. The password will be hidden after copying."
                                : "The password has been copied to your clipboard and is no longer visible for security reasons."}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}