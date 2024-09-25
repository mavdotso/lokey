import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useQuery, useAction } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { CurrencyType, IntervalType, User, Workspace } from "@/convex/types";
import { CURRENCIES, INTERVALS, PLANS } from "@/convex/schema";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { SettingsCard } from "../settings-card";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/global/loading-screen";

interface BillingSettingsProps {
    user: Partial<User>
    workspace: Workspace
}

export default function BillingSettings({ user, workspace }: BillingSettingsProps) {
    const router = useRouter();

    const products = useQuery(api.stripe.getProducts);
    const prices = useQuery(api.stripe.getPrices);

    const [selectedPlanId, setSelectedPlanId] = useState<Id<"products"> | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<IntervalType>(INTERVALS.MONTH);

    const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
    const createStripeBillingPortalSession = useAction(api.stripe.createStripeBillingPortalSession);

    const currency: CurrencyType = CURRENCIES.USD;

    async function handleCreateCheckoutSession() {
        if (!user._id || !workspace._id || !prices || !products) return;

        try {
            if (workspace.planType === PLANS.FREE) {
                const teamProduct = products.find(p => p.name.toUpperCase() === PLANS.TEAM);
                if (!teamProduct) {
                    throw new Error("TEAM plan product not found");
                }

                const teamPrice = prices.find(p => p.productId === teamProduct._id && p.interval === selectedInterval);

                if (!teamPrice) {
                    throw new Error("Price for TEAM plan not found");
                }

                const { sessionId } = await createCheckoutSession({
                    userId: user._id,
                    priceId: teamPrice.stripeId,
                    quantity: 1,
                    metadata: {
                        workspaceId: workspace._id,
                        planName: PLANS.TEAM,
                    },
                });

                router.push(`https://checkout.stripe.com/c/pay/${sessionId}`);
            } else {
                console.log("Already on the highest plan (TEAM)");
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
        }
    };

    async function handleCreateBillingPortalSession() {
        if (!user._id || !workspace._id) { console.log("No user id or workspace id"); return };

        try {
            const { url } = await createStripeBillingPortalSession({
                userId: user._id,
                workspaceId: workspace._id
            });

            if (url) window.location.href = url;

        } catch (error) {
            console.error("Error creating billing portal session:", error);
        }

    };

    if (!user || !workspace || !products || !prices) return <LoadingScreen />;

    return (
        <div className="flex flex-col gap-6 w-full h-full">
            <SettingsCard
                title={`Plan for ${workspace.name}`}
                description={
                    <>
                        Current plan:{" "}
                        <Badge variant={"secondary"}>
                            {workspace.planType}
                        </Badge>
                    </>
                }
                buttonText={workspace.planType === PLANS.FREE ? "Upgrade Plan" : "Change Plan"}
                onSave={handleCreateCheckoutSession}
                footerText="You will not be charged for testing the subscription upgrade."
            >
                <div className="flex flex-col justify-evenly items-center gap-4 w-full">
                    {products.map((product) => {
                        const price = prices.find(p => p.productId === product._id && p.interval === selectedInterval);
                        return (
                            <div key={product._id}
                                className={`flex w-full items-center rounded-md border p-4 cursor-pointer transition-colors
                                ${selectedPlanId === product._id
                                        ? "border-primary bg-secondary"
                                        : "border-border hover:bg-muted"}`}
                                onClick={() => setSelectedPlanId(product._id)}>
                                <div className="flex flex-col items-start w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-base">{product.name}</span>
                                        {price && (
                                            <span className="bg-muted px-1.5 py-0.5 rounded-md text-sm">
                                                {currency === CURRENCIES.USD ? "$" : "€"}{" "}
                                                {price.unitAmount / 100} / {price.interval}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-secondary-foreground text-sm">{product.description}</p>
                                </div>

                                {product.name !== "Free" && (
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="interval-switch" className="text-secondary-foreground text-sm">
                                            {selectedInterval === INTERVALS.MONTH ? "Monthly" : "Yearly"}
                                        </label>
                                        <Switch
                                            id="interval-switch"
                                            checked={selectedInterval === INTERVALS.YEAR}
                                            onCheckedChange={() =>
                                                setSelectedInterval(prev =>
                                                    prev === INTERVALS.MONTH ? INTERVALS.YEAR : INTERVALS.MONTH
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </SettingsCard>

            <SettingsCard
                title={`Manage Subscription for ${workspace.name}`}
                description="Update your payment method, billing address, and more."
                buttonText="Manage"
                onSave={handleCreateBillingPortalSession}
                footerText="You will be redirected to the Stripe Customer Portal."
            >{" "}</SettingsCard>
        </div>
    );
}