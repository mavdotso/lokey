'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';

export default function Home() {
  const [password, setPassword] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
  };

  return (
    <div className="bg-white shadow-xl mx-auto mt-10 p-6 rounded-lg max-w-md">
      <h1 className="mb-6 font-bold text-2xl text-center">Secure Password Sharing</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password" className="block font-medium text-gray-700 text-sm">
            Password to share
          </Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block border-gray-300 focus:border-indigo-300 focus:ring-opacity-50 shadow-sm mt-1 rounded-md focus:ring focus:ring-indigo-200 w-full"
            placeholder="Enter the password you want to share"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create One-Time Link'}
        </Button>
      </form>
      {error && (
        <div className="mt-4 text-red-600 text-sm">
          {error}
        </div>
      )}
      {link && (
        <div className="mt-4">
          <h2 className="mb-2 font-semibold text-lg">Your one-time link:</h2>
          <div className="bg-gray-100 p-3 rounded break-all">
            <a href={link} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {link}
            </a>
          </div>
          <p className="mt-2 text-gray-600 text-sm">
            This link will expire after 24 hours or after it's been accessed once.
          </p>
        </div>
      )}
    </div>
  );
};
