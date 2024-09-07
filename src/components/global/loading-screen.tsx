import LoadingSpinner from "@/components/global/loading-spinner";

export default function LoadingScreen({ loadingText }: { loadingText?: string }) {
    return (
        <div className="fixed inset-0 flex justify-center items-center bg-primary-foreground/80 backdrop-blur-sm w-screen h-screen">
            <LoadingSpinner /> <p>{loadingText}</p>
        </div>
    )
}