import { Button } from "@/components/ui/button";

export function UpgradeBox() {
    return (
        <div className="flex flex-col gap-2 bg-linear-to-b from-card to-muted p-4 pb-10 rounded-lg text-center">
            <h2 className="font-bold text-lg text-primary">Upgrade to Pro</h2>
            <p className="text-muted-foreground text-sm">Get 1 month free and unlock all features</p>
            <Button>
                Upgrade
            </Button>
        </div>
    );
}