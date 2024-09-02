import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Link, Tailwind } from '@react-email/components';

interface EmailProps {
    url: string;
    host: string;
}

const tailwindConfig = {
    theme: {
        extend: {
            colors: {
                brand: '#007291',
            },
        },
    },
};

export function VerificationEmail({ url, host }: EmailProps) {
    const escapedHost = host.replace(/\./g, '&#8203;.');

    return (
        <Html>
            <Head />
            <Tailwind config={tailwindConfig}>
                <Body className="bg-gray-100 font-sans">
                    <Container className="mx-auto p-4 max-w-xl">
                        <Section className="bg-white shadow-lg p-8 rounded-lg">
                            <Text className="mb-4 font-bold text-2xl text-center text-gray-800">Secure Password Sharing</Text>
                            <Text className="mb-6 text-center text-gray-600 text-lg">With Superpowers</Text>
                            <hr className="border-gray-300 my-6 border-t" />
                            <Text className="mb-6 text-center text-gray-800 text-lg">Sign in to <strong>{escapedHost}</strong></Text>
                            <Link
                                href={url}
                                target="_blank"
                                className="block bg-brand py-3 rounded-md w-full font-medium text-center text-white"
                            >
                                Sign in
                            </Link>
                            <Text className="mt-6 text-center text-gray-600 text-sm">
                                This is a one-time use link that will expire shortly.
                            </Text>
                            <Text className="mt-2 text-center text-gray-600 text-sm">
                                If you did not request this email, you can safely ignore it.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

// Text version (optional, but recommended for better accessibility)
export function text({ url, host }: EmailProps) {
    return `
Sign in to ${host}

Use the link below to sign in:
${url}

If you did not request this email, you can safely ignore it.
  `;
}