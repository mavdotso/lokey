'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signInWithEmail } from '@/lib/server-actions/auth-actions'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SignIn() {
    const [email, setEmail] = useState('')

    async function handleLogin(email: string) {
        try {
            await signInWithEmail({ email })
            toast.success('Check your email for the login link!')
        } catch (error: any) {
            toast.error(error.error_description || error.message)
        }
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
                <div className="flex gap-4">
                    <Input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button onClick={() => handleLogin(email)}>
                        Send magic link
                    </Button>
                </div>
            </div>
        </div>
    )
}