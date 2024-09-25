import { SubmitButton } from '@/components/global/submit-button'
import { Input } from '@/components/ui/input'
import { signin } from '@/lib/server-actions'

export default function SignIn() {
    return (
        <div className="flex flex-col justify-center bg-background pt-20">
            <div className="space-y-4 w-full max-w-md">
                <div>
                    <h2 className="pt-6 font-bold text-4xl tracking-tight">
                        Sign in to your account
                    </h2>
                    <p className="pt-2 text-md text-muted-foreground">
                        Or enter your email to get started
                    </p>
                </div>
                <form action={signin} className="flex flex-row justify-center items-center gap-2 py-4 max-w-lg">
                    <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                    />
                    <SubmitButton text='Sign in with Magic link' pendingText='Sending Magic Link...' />
                </form>
                <p className="text-muted-foreground text-xs">
                    You will receive a sign-in link to your email address.<br />
                    If you don&apos;t have an account yet, we&apos;ll create one for you automatically.
                </p>
            </div>
        </div>
    )
}