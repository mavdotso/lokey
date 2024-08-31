'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signInWithEmail } from '@/lib/server-actions/auth-actions'
import { useState } from 'react'

export default function Auth() {

    const [email, setEmail] = useState('')

    async function handleLogin(email: string) {
        try {
            await signInWithEmail({ email })
            alert('Check your email for the login link!')
        } catch (error: any) {
            alert(error.error_description || error.message)
        }
    }

    return (
        <div>
            <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={() => handleLogin(email)}>Send magic link</Button>
        </div>
    )
}