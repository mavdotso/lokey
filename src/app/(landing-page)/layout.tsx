import { Header } from "@/components/header";

export default function LandingPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col mx-auto px-4 max-w-2xl min-h-screen container">
            <Header />
            <div className="flex-grow">{children}</div>
        </div>
    );
}