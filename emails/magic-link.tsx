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