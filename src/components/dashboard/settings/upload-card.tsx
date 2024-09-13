"use client"
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ImageUpload } from "@/components/global/image-upload";
import { toast } from 'sonner';
import { MAX_LOGO_SIZE } from '@/lib/consts';

export interface UploadCardProps {
    title: string;
    description: string;
    acceptedFileTypes?: string;
    onUploadComplete: (storageId: Id<"_storage">) => void;
}

export function UploadCard({ title, description, acceptedFileTypes = 'image/*', onUploadComplete }: UploadCardProps) {
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const fileInput = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleUpload() {
        if (!selectedFile) return;

        if (selectedFile.size > MAX_LOGO_SIZE) {
            setError(`File size exceeds the limit of ${MAX_LOGO_SIZE / 1024 / 1024}MB`);
            toast.error(`File size exceeds the limit of ${MAX_LOGO_SIZE / 1024 / 1024}MB`);
            return;
        }

        setIsUploading(true);
        setError(null);
        try {
            const postUrl = await generateUploadUrl();

            const result = await fetch(postUrl, {
                method: 'POST',
                headers: { 'Content-Type': selectedFile.type },
                body: selectedFile,
            });

            const { storageId } = await result.json();

            onUploadComplete(storageId);

            setUploadedImagePath(URL.createObjectURL(selectedFile));
            setSelectedFile(null);
            if (fileInput.current) fileInput.current.value = '';
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error('Upload failed:', error);
            setError('Upload failed. Please try again.');
            toast.error('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_LOGO_SIZE) {
                setError(`File size exceeds the limit of ${MAX_LOGO_SIZE / 1024 / 1024}MB`);
                toast.error(`File size exceeds the limit of ${MAX_LOGO_SIZE / 1024 / 1024}MB`);
                event.target.value = '';
            } else {
                setSelectedFile(file);
                setError(null);
            }
        }
    };

    function handleDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            if (file.size > MAX_LOGO_SIZE) {
                setError(`File size exceeds the limit of ${MAX_LOGO_SIZE / 1024 / 1024}MB`);
                toast.error(`File size exceeds the limit of ${MAX_LOGO_SIZE / 1024 / 1024}MB`);
            } else {
                setSelectedFile(file);
                setError(null);
            }
        }
    };

    function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
    };

    return (
        <Card className="shadow-none overflow-hidden">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInput.current?.click()}
                >
                    <ImageUpload
                        loading={isUploading}
                        progress={uploadProgress}
                        uploadedImagePath={uploadedImagePath}
                        selectedFileName={selectedFile?.name || null}
                        error={error}
                    />
                    <input
                        type="file"
                        accept={acceptedFileTypes}
                        ref={fileInput}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end items-center gap-2 bg-muted py-4">
                <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
            </CardFooter>
        </Card>
    );
}