'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckIcon, CopyIcon, KeySquareIcon } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toast } from "sonner"
import Link from 'next/link';


export default function Home() {
  const [password, setPassword] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setLink('');

    try {
      const response = await fetch('/api/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Failed to create link');
      }

      const data = await response.json();
      setLink(data.link);
    } catch (err) {
      setError('An error occurred while creating the link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-gradient-to-b from-purple-50 to-background min-h-screen">
      <header className="flex justify-between items-center mx-auto p-4 container">
        <Link href={"/"} className="flex items-center gap-2 font-medium text-xl"><KeySquareIcon className='w-4 h-4' /> lokey.cc</Link>

        <nav className="space-x-4 text-sm">
          <a href="#" className="text-muted-foreground hover:text-foreground">Product</a>
          <a href="#" className="text-muted-foreground hover:text-foreground">Solutions</a>
          <a href="#" className="text-muted-foreground hover:text-foreground">Customers</a>
          <a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a>
          <a href="#" className="text-muted-foreground hover:text-foreground">Resources</a>
        </nav>

        <div className="space-x-2">
          <Button variant="outline">Log in</Button>
          <Button>Sign Up</Button>
        </div>
      </header>

      <main className="flex flex-col flex-grow justify-center items-center p-4">
        <div className="mb-8 text-center">
          <h1 className="mb-4 font-bold text-5xl">Secure Password Sharing <br /> With <span className="text-chart-5">Superpowers</span></h1>
          <p className="mb-4 text-muted-foreground text-xl">
            Share passwords securely <br /> with one-time links that expire after use.
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            <Button size="lg">Start for Free</Button>
            <Button variant="outline" size="lg">How It Works</Button>
          </div>
        </div>

        <Card className="w-full max-w-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the password you want to share"
                className="w-full"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Generating link...' : 'Share password'}
              </Button>
            </form>

            {link && (
              <div className="space-y-4 mt-6">
                <div className="flex items-center bg-muted p-3 rounded-md">
                  <ScrollArea className="rounded-md w-full whitespace-nowrap">
                    <div className="font-medium text-muted-foreground text-sm">{link}</div>
                    <ScrollBar orientation="horizontal" className='pt-2' />
                  </ScrollArea>
                  <Button size="sm" variant="outline" onClick={handleCopyLink}>
                    {isCopied ? (
                      <>
                        <CheckIcon className="mr-2 w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="mr-2 w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex justify-center items-center w-full text-center text-muted-foreground text-sm">
                  <span className="mr-2">⏳</span>
                  <span>One-time use link</span>
                </div>
              </div>
            )}

            {error && <div className="mt-4 text-destructive text-sm">{error}</div>}
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-muted-foreground text-sm">
          Want to manage your shared passwords or view their usage? <br />
          <a href="#" className="text-primary hover:underline">Create a free account on Lokey</a> to get started.
        </p>
      </main>

      <footer className="p-4 text-center text-muted-foreground">
        Giving superpowers to modern teams for secure password sharing
      </footer>
    </div>
  );
}