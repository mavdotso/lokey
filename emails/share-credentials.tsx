import React from 'react';
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text, Tailwind } from "@react-email/components";

interface ShareCredentialsEmailProps {
    url: string;
    host: string;
}

export function ShareCredentialsEmail({ url, host }: ShareCredentialsEmailProps) {
    const previewText = `Credentials have been securely shared with you`;
    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-muted font-sans">
                    <Container className="bg-background shadow-md mx-auto my-[40px] p-[20px] border border-solid rounded-[10px] max-w-[600px]">
                        <Section className="mt-[32px] text-center">
                            <Heading className="m-0 font-normal text-[24px] text-foreground">
                                Secure Credential Sharing
                            </Heading>
                            <Text className="mt-[10px] mb-[20px] text-[16px] text-muted-foreground">
                                With Superpowers
                            </Text>
                        </Section>
                        <Section className="mt-[32px] mb-[32px] text-center">
                            <Text className="mb-[20px] text-[18px] text-foreground">
                                Access your securely shared credentials on <strong>{host}</strong>
                            </Text>
                            <Button
                                href={url}
                                className="bg-primary px-6 py-3 rounded font-bold text-[16px] text-primary-foreground no-underline"
                            >
                                View Credentials
                            </Button>
                        </Section>
                        <Section className="mt-[32px] text-center">
                            <Text className="m-0 text-[14px] text-muted-foreground">
                                These credentials will be deleted after you close the page.
                            </Text>
                            <Text className="mt-[10px] mb-0 text-[14px] text-muted-foreground">
                                Make sure to copy and store them securely.
                            </Text>
                        </Section>
                        <Section className="mt-[32px] text-center">
                            <Text className="m-0 text-[12px] text-muted-foreground">
                                If you did not request these credentials, please ignore this email.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

ShareCredentialsEmail.PreviewProps = {
    url: "https://example.com/share/credentials",
    host: "example.com",
} as ShareCredentialsEmailProps;

export default ShareCredentialsEmail;