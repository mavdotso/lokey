import Image from "next/image";
import { CloudUploadIcon } from "lucide-react";
import { RadialProgress } from "@/components/global/radial-progress";

interface ImageUploadProps {
    loading: boolean;
    progress: number;
    uploadedImagePath: string | null;
    selectedFileName: string | null;
    error: string | null;
}

export function ImageUpload({ loading, progress, uploadedImagePath, selectedFileName, error }: ImageUploadProps) {
    return (
        <div className="relative flex flex-col justify-center items-center border-2 bg-card hover:bg-primary-foreground p-6 border-border border-dashed rounded-lg w-full h-full cursor-pointer">
            {loading && (
                <div className="max-w-md text-center">
                    <RadialProgress progress={progress} />
                    <p className="font-semibold text-sm">Uploading image</p>
                    <p className="text-muted-foreground text-xs">
                        Do not refresh or perform any other action while the image is
                        being uploaded
                    </p>
                </div>
            )}

            {!loading && !uploadedImagePath && (
                <div className="text-center">
                    <div className="mx-auto p-2 border rounded-md max-w-min">
                        <CloudUploadIcon />
                    </div>

                    <p className="mt-2 text-muted-foreground text-sm">
                        <span className="font-semibold">
                            {selectedFileName ? `Selected: ${selectedFileName}` : "Drag an image"}
                        </span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                        {selectedFileName ? "Click upload to proceed" : "Select an image or drag here to upload directly"}
                    </p>
                    {error && <p className="mt-2 text-red-500 text-xs">{error}</p>}
                </div>
            )}

            {uploadedImagePath && !loading && (
                <div className="space-y-2 text-center">
                    <Image
                        width={1000}
                        height={1000}
                        src={uploadedImagePath}
                        className="opacity-70 w-full max-h-16 object-contain"
                        alt="uploaded image"
                    />
                    <div className="space-y-1">
                        <p className="font-semibold text-sm">Image Uploaded</p>
                    </div>
                </div>
            )}
        </div>
    );
};