import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signIn } from '@/lib/auth'
import { toast } from 'sonner'

export default function SignIn() {

    async function handleSubmit(formData: FormData) {
        'use server';
        await signIn("resend", formData);
        toast.success('Check your email for a magic link');
    }

    return (
        <div className="flex flex-col justify-center bg-background">
            <div className="space-y-4 w-full max-w-md">
                <div>
                    <h2 className="pt-6 font-bold text-3xl tracking-tight">
                        Sign in to your account
                    </h2>
                    <p className="pt-2 text-muted-foreground text-sm">
                        Or start your 14-day free trial
                    </p>
                </div>
                <form action={handleSubmit} className="flex flex-row justify-center gap-2 space-y-4 py-4 max-w-lg">
                    <Input type="email" name="email" placeholder="Enter your email" required />
                    <Button type="submit">
                        Sign in with Magic link
                    </Button>
                </form>
                <span className="text-center text-secondary-foreground text-xs">
                    You will recieve a sign-in link to your email address
                </span>
            </div>
        </div>
    )
}