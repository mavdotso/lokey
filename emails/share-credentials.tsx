import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text, Tailwind, Hr } from "@react-email/components";
import EmailLogo from "./components/logo";

interface ShareCredentialsEmailProps {
    url: string;
    host: string;
}

export function ShareCredentialsEmail({ url, host }: ShareCredentialsEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Access shared credentials on {host}</Preview>
            <Tailwind>
                <Body className="bg-muted font-sans">
                    <Container className="border-[#eaeaea] mx-auto my-[40px] p-[20px] border border-solid rounded max-w-[465px]">
                        <Section className="mt-[20px] text-center">
                            <EmailLogo />
                        </Section>
                        <Section className="mt-[32px] mb-[32px] text-center">
                            <Text className="mx-0 my-[34px] p-0 font-normal text-[24px] text-black text-center">
                                Access shared credentials on <strong>{host}</strong>
                            </Text>
                            <Button
                                href={url}
                                className="bg-[#000000] px-5 py-3 rounded font-semibold text-[12px] text-center text-white no-underline"
                            >
                                View Credentials
                            </Button>
                            <Text className="text-[12px] text-center leading-[24px]">
                                These credentials will be deleted after you close the page.
                            </Text>
                            <Text className="text-[12px] text-center leading-[24px]">
                                <strong>The button doesn&apos;t work?</strong><br /> Copy and paste the link into your browser:<br /> <Link href={url} target="_blank">{url}</Link>
                            </Text>
                        </Section>
                        <Hr className="border-[#eaeaea] mx-0 my-[14px] border border-solid w-full" />
                        <Section className="mt-[20px]">
                            <Text className="text-[#666666] text-[12px] text-center leading-[24px]">
                                Make sure to copy and store the credentials securely. <br /> If you did not request these credentials, you can safely ignore this email.
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