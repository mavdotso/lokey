import { LoadingSpinner } from "@/components/global/loading-spinner";

export function LoadingScreen() {
    return (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-primary-foreground/80 backdrop-blur-xs w-screen h-screen">
            <LoadingSpinner />
        </div>
    )
}