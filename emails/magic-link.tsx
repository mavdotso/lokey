import { Body, Button, Container, Column, Head, Heading, Hr, Html, Img, Link, Preview, Row, Section, Text, Tailwind } from "@react-email/components";
import React from "react";

interface SecurePasswordSharingEmailProps {
  url: string;
  host: string;
}

export function MagicLinkEmail({ url, host }: SecurePasswordSharingEmailProps) {

  const previewText = `Sign in to ${host}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-muted font-sans">
          <Container className="bg-background shadow-md mx-auto my-[40px] p-[20px] border border-solid rounded-[10px] max-w-[600px]">
            <Section className="mt-[32px] text-center">
              <Heading className="m-0 font-normal text-[24px] text-foreground">
                Secure Password Sharing
              </Heading>
              <Text className="mt-[10px] mb-[20px] text-[16px] text-muted-foreground">
                With Superpowers
              </Text>
            </Section>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Text className="mb-[20px] text-[18px] text-foreground">
                Sign in to <strong>{host}</strong>
              </Text>
              <Button href={url} className="bg-primary px-6 py-3 rounded font-bold text-[16px] text-primary-foreground no-underline">
                Sign in
              </Button>
            </Section>
            <Section className="mt-[32px] text-center">
              <Text className="m-0 text-[14px] text-muted-foreground">
                This is a one-time use link that will expire shortly.
              </Text>
              <Text className="mt-[10px] mb-0 text-[14px] text-muted-foreground">
                If you did not request this email, you can safely ignore it.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};


export function html({ url, host }: { url: string; host: string }) {
  const escapedHost = host.replace(/\./g, '&#8203;.');

  return `
      <body style="background: #f9f9f9; font-family: Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: #ffffff; max-width: 600px; margin: auto; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <h1 style="color: #333333; font-size: 24px; margin: 0;">Secure Password Sharing</h1>
              <p style="color: #666666; font-size: 16px; margin: 10px 0 20px;">With Superpowers</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 0;">
              <p style="color: #333333; font-size: 18px; margin: 0 0 20px;">Sign in to <strong>${escapedHost}</strong></p>
              <a href="${url}" target="_blank" style="background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; font-weight: bold;">Sign in</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 0;">
              <p style="color: #666666; font-size: 14px; margin: 0;">
                This is a one-time use link that will expire shortly.
              </p>
              <p style="color: #666666; font-size: 14px; margin: 10px 0 0;">
                If you did not request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </body>
    `;
}

export function text({ url, host }: { url: string; host: string }) {
  return `
  Sign in to ${host}
  
  Use the link below to sign in:
  ${url}
  
  If you did not request this email, you can safely ignore it.
    `;
}