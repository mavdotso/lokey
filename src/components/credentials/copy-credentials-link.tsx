'use client'
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CopyCredentialsLink({ credentialsLink }: { credentialsLink: string }) {
    const [isCopied, setIsCopied] = useState(false);

    function copyToClipboard() {
        navigator.clipboard.writeText(credentialsLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="flex flex-col space-y-4 max-w-full overflow-hidden">
            <div className="relative flex items-center bg-muted p-3 rounded-md max-w-full">
                <div className="p-3 font-medium text-muted-foreground text-sm whitespace-nowrap overflow-x-scroll">{credentialsLink}</div>
                <Button size="sm" variant="outline" onClick={copyToClipboard} className="top-1/2 right-3 absolute transform -translate-y-1/2">
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
                One-time use link. This link is shown only once and is the only way to access the credentials.
            </p>
        </div>
    )
}