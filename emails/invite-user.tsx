import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text, Tailwind } from "@react-email/components";

interface InviteUserEmailProps {
    invitedByUsername: string;
    workspaceName: string;
    inviteLink: string;
}

export function InviteUserReact({ invitedByUsername, workspaceName, inviteLink }: InviteUserEmailProps) {
    const previewText = `Join ${workspaceName} on Secure Password Sharing`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-background mx-auto my-auto px-2 font-sans text-foreground">
                    <Container className="mx-auto my-[40px] p-[20px] border border-border border-solid rounded max-w-[465px]">
                        <Heading className="mx-0 my-[30px] p-0 font-normal text-[24px] text-center text-foreground">
                            Join <strong>{workspaceName}</strong> on <strong>Secure Password Sharing</strong>
                        </Heading>
                        <Text className="text-[14px] text-foreground leading-[24px]">
                            Hello,
                        </Text>
                        <Text className="text-[14px] text-foreground leading-[24px]">
                            <strong>{invitedByUsername}</strong> has invited you to join the <strong>{workspaceName}</strong> workspace on{" "}
                            <strong>Secure Password Sharing</strong>.
                        </Text>
                        <Section className="mt-[32px] mb-[32px] text-center">
                            <Button
                                className="bg-primary px-5 py-3 rounded font-semibold text-[12px] text-center text-primary-foreground no-underline"
                                href={inviteLink}
                            >
                            </Button>
                        </Section>
                        <Text className="text-[14px] text-foreground leading-[24px]">
                            or copy and paste this URL into your browser:{" "}
                            <Link href={inviteLink} className="text-primary no-underline">
                                {inviteLink}
                            </Link>
                        </Text>
                        <Hr className="mx-0 my-[26px] border border-border border-solid w-full" />
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};


export function InviteUserText({ invitedByUsername, workspaceName, inviteLink }: InviteUserEmailProps) {
    return `
Join ${workspaceName} on Secure Password Sharing

Hello,

${invitedByUsername} has invited you to join the ${workspaceName} workspace on Secure Password Sharing.

To join the workspace, please visit the following link:
${inviteLink}

If you can't click on the link above, copy and paste it into your browser.
`;
}