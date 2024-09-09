import { LoadingSpinner } from "@/components/global/loading-spinner";

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex justify-center items-center bg-primary-foreground/80 backdrop-blur-sm w-screen h-screen">
            <LoadingSpinner />
        </div>
    )
}