"use client"
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ImageUpload } from "@/components/global/image-upload";

export interface UploadCardProps {
    title: string;
    description: string;
    acceptedFileTypes?: string;
    onUploadComplete: (storageId: Id<"_storage">) => void;
    entityType: 'workspace' | 'user';
    entityId: string;
}

export function UploadCard({ title, description, acceptedFileTypes = 'image/*', onUploadComplete, entityType, entityId }: UploadCardProps) {
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const fileInput = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);

    async function handleUpload() {
        if (!selectedFile) return;

        setIsUploading(true);
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
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    function handleDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
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