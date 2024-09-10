import { Body, Button, Container, Column, Head, Heading, Hr, Html, Img, Link, Preview, Row, Section, Text, Tailwind } from "@react-email/components";

interface VercelInviteUserEmailProps {
    username?: string;
    userImage?: string;
    invitedByUsername?: string;
    invitedByEmail?: string;
    teamName?: string;
    teamImage?: string;
    inviteLink?: string;
    inviteFromIp?: string;
    inviteFromLocation?: string;
}

const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "";

export function VercelInviteUserEmail({ username, userImage, invitedByUsername, invitedByEmail, teamName, teamImage, inviteLink, inviteFromIp, inviteFromLocation }: VercelInviteUserEmailProps) {

    const previewText = `Join ${invitedByUsername} on Vercel`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-background mx-auto my-auto px-2 font-sans text-foreground">
                    <Container className="mx-auto my-[40px] p-[20px] border border-border border-solid rounded max-w-[465px]">
                        <Section className="mt-[32px]">
                            <Img
                                src={`${baseUrl}/static/vercel-logo.png`}
                                width="40"
                                height="37"
                                alt="Vercel"
                                className="mx-auto my-0"
                            />
                        </Section>
                        <Heading className="mx-0 my-[30px] p-0 font-normal text-[24px] text-center text-foreground">
                            Join <strong>{teamName}</strong> on <strong>Vercel</strong>
                        </Heading>
                        <Text className="text-[14px] text-foreground leading-[24px]">
                            Hello {username},
                        </Text>
                        <Text className="text-[14px] text-foreground leading-[24px]">
                            <strong>{invitedByUsername}</strong> (
                            <Link
                                href={`mailto:${invitedByEmail}`}
                                className="text-primary no-underline"
                            >
                                {invitedByEmail}
                            </Link>
                            ) has invited you to the <strong>{teamName}</strong> team on{" "}
                            <strong>Vercel</strong>.
                        </Text>
                        <Section>
                            <Row>
                                <Column align="right">
                                    <Img
                                        className="rounded-full"
                                        src={userImage}
                                        width="64"
                                        height="64"
                                    />
                                </Column>
                                <Column align="center">
                                    <Img
                                        src={`${baseUrl}/static/vercel-arrow.png`}
                                        width="12"
                                        height="9"
                                        alt="invited you to"
                                    />
                                </Column>
                                <Column align="left">
                                    <Img
                                        className="rounded-full"
                                        src={teamImage}
                                        width="64"
                                        height="64"
                                    />
                                </Column>
                            </Row>
                        </Section>
                        <Section className="mt-[32px] mb-[32px] text-center">
                            <Button
                                className="bg-primary px-5 py-3 rounded font-semibold text-[12px] text-center text-primary-foreground no-underline"
                                href={inviteLink}
                            >
                                Join the team
                            </Button>
                        </Section>
                        <Text className="text-[14px] text-foreground leading-[24px]">
                            or copy and paste this URL into your browser:{" "}
                            <Link href={inviteLink} className="text-primary no-underline">
                                {inviteLink}
                            </Link>
                        </Text>
                        <Hr className="mx-0 my-[26px] border border-border border-solid w-full" />
                        <Text className="text-[12px] text-muted-foreground leading-[24px]">
                            This invitation was intended for{" "}
                            <span className="text-foreground">{username}</span>. This invite was
                            sent from <span className="text-foreground">{inviteFromIp}</span>{" "}
                            located in{" "}
                            <span className="text-foreground">{inviteFromLocation}</span>. If you
                            were not expecting this invitation, you can ignore this email. If
                            you are concerned about your account&apos;s safety, please reply to
                            this email to get in touch with us.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

VercelInviteUserEmail.PreviewProps = {
    username: "alanturing",
    userImage: `${baseUrl}/static/vercel-user.png`,
    invitedByUsername: "Alan",
    invitedByEmail: "alan.turing@example.com",
    teamName: "Enigma",
    teamImage: `${baseUrl}/static/vercel-team.png`,
    inviteLink: "https://vercel.com/teams/invite/foo",
    inviteFromIp: "204.13.186.218",
    inviteFromLocation: "São Paulo, Brazil",
} as VercelInviteUserEmailProps;

export default VercelInviteUserEmail;