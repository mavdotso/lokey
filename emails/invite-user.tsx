import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text, Tailwind } from "@react-email/components";
import EmailLogo from "./components/logo";

interface InviteUserEmailProps {
    invitedByUsername: string;
    workspaceName: string;
    inviteLink: string;
}

export default function InviteUserReact({ invitedByUsername, workspaceName, inviteLink }: InviteUserEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Join {workspaceName} on Lokey</Preview>
            <Tailwind>
                <Body className="bg-muted font-sans">
                    <Container className="border-[#eaeaea] mx-auto my-[40px] p-[20px] border border-solid rounded max-w-[465px]">
                        <Section className="mt-[20px] text-center">
                            <EmailLogo />
                        </Section>
                        <Section className="mt-[32px] mb-[32px] text-center">
                            <Text className="mx-0 my-[34px] p-0 font-normal text-[24px] text-black text-center">
                                Join <strong>{workspaceName}</strong> on <strong>Lokey</strong>
                            </Text>
                            <Text className="text-[14px] text-black leading-[24px]">
                                Hello,
                            </Text>
                            <Text className="text-[14px] text-black leading-[24px]">
                                <strong>{invitedByUsername}</strong> has invited you to join the <strong>{workspaceName}</strong> workspace on <strong>Lokey</strong>.
                            </Text>
                            <Button
                                href={inviteLink}
                                className="bg-[#000000] px-5 py-3 rounded font-semibold text-[12px] text-center text-white no-underline"
                            >
                                Join Workspace
                            </Button>
                            <Text className="text-[12px] text-center leading-[24px]">
                                <strong>The button doesn&apos;t work?</strong><br /> Copy and paste this URL into your browser:<br />
                                <Link href={inviteLink} className="text-[#0000EE] no-underline">
                                    {inviteLink}
                                </Link>
                            </Text>
                        </Section>
                        <Hr className="border-[#eaeaea] mx-0 my-[14px] border border-solid w-full" />
                        <Section className="mt-[20px]">
                            <Text className="text-[#666666] text-[12px] text-center leading-[24px]">
                                If you did not expect this invitation, you can safely ignore this email.
                            </Text>
                        </Section>
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

${invitedByUsername} has invited you to join the ${workspaceName} workspace on Lokey.

To join the workspace, please visit the following link:
${inviteLink}

If you can't click on the link above, copy and paste it into your browser.
`;
}