import { Section } from "@react-email/components";
import { KeyIcon } from "lucide-react";

export default function EmailLogo() {
    return (
        <Section className="flex justify-center items-center text-[16px]">
            <KeyIcon className='inline-block mr-[6px] w-6 h-6 align-middle' />
            <span className="inline-block leading-[24px] align-middle">lokey</span>
        </Section>
    )
}