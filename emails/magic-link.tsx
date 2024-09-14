import { Body, Button, Container, Head, Html, Preview, Section, Text, Tailwind, Hr, Link } from "@react-email/components";
import EmailLogo from "./components/logo";

interface SecurePasswordSharingEmailProps {
  url: string;
  host: string;
}

export default function MagicLinkEmailReact({ url, host }: SecurePasswordSharingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to ${host}</Preview>
      <Tailwind>
        <Body className="bg-muted font-sans">
          <Container className="border-[#eaeaea] mx-auto my-[40px] p-[20px] border border-solid rounded max-w-[465px]">
            <Section className="mt-[20px] text-center">
              <EmailLogo />
            </Section>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Text className="mx-0 my-[34px] p-0 font-normal text-[24px] text-black text-center">
                Sign in to <strong>{host}</strong>
              </Text>
              <Button href={url} className="bg-[#000000] px-5 py-3 rounded font-semibold text-[12px] text-center text-white no-underline">
                Sign in with Magic Link
              </Button>
              <Text className="text-[12px] text-center leading-[24px]">
                This link and code will only be valid for the next 5 minutes.
              </Text>
              <Text className="text-[12px] text-center leading-[24px]">
                <strong>The button doesn&apos;t work?</strong><br /> Copy and paste the link into your browser:<br /> <Link href={url} target="_blank" >{url}</Link>
              </Text>
            </Section>
            <Hr className="border-[#eaeaea] mx-0 my-[14px] border border-solid w-full" />
            <Section className="mt-[20px]">
              <Text className="text-[#666666] text-[12px] text-center leading-[24px]">
                This is a one-time use link that will expire shortly. <br /> If you did not request this email, you can safely ignore it.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html >
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

export function MagicLinkEmailText({ url, host }: { url: string; host: string }) {
  return `
  Sign in to ${host}
  
  Use the link below to sign in:
  ${url}
  
  If you did not request this email, you can safely ignore it.
    `;
}

MagicLinkEmailReact.PreviewProps = {
  url: "https://lokey.app/auth/magic-link?token=example",
  host: "lokey.app",
} as SecurePasswordSharingEmailProps;