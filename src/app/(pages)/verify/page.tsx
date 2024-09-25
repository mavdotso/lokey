import { Button } from '@/components/ui/button';
import { CheckCircleIcon } from 'lucide-react';
import Link from 'next/link';

export default function Verify() {
    return (
        <>
            <div className="pt-20">
                <h1 className="pb-4 font-bold text-5xl">
                    Magic Link Sent. <br /> Check Your Email!
                </h1>
                <p className="text-lg text-muted-foreground">
                    We&apos;ve sent a magic link to your email address. Click the link to sign in.
                </p>
            </div>

            <div className='flex flex-col pt-8 max-w-xl'>
                <div className="space-y-4">
                    <div className="flex items-center bg-muted p-6 rounded-md">
                        <CheckCircleIcon className="mr-4 w-12 h-12 text-primary" />
                        <div>
                            <h2 className="font-semibold text-xl">Magic Link Sent Successfully</h2>
                            <p className="text-muted-foreground">Please check your email inbox and spam folder.</p>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        <span className="pr-2">⏳</span>
                        The magic link will expire in 10 minutes
                    </p>
                </div>

                <div className="mt-8">
                    <Link href="/">
                        <Button>Back to Home</Button>
                    </Link>
                </div>
            </div>
            <p className="pt-4 text-muted-foreground text-xs">
                Didn&apos;t receive the email? <br />
                <Link href="/sign-in" className="text-primary hover:underline">Click here to try again</Link> or check your spam folder.
            </p>
        </>
    );
}