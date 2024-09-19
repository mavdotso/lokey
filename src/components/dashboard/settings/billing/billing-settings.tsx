import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useAction } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { CurrencyType, IntervalType, User, Workspace } from "@/convex/types";
import { CURRENCIES, INTERVALS, PLANS } from "@/convex/schema";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

interface BillingSettingsProps {
    user: Partial<User>;
    workspace: Workspace;
}

export default function BillingSettings({ user, workspace }: BillingSettingsProps) {
    const router = useRouter();

    const products = useQuery(api.stripe.getProducts);
    const prices = useQuery(api.stripe.getPrices);

    const [selectedPlanId, setSelectedPlanId] = useState<Id<"products"> | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<IntervalType>(INTERVALS.MONTH);

    const createCheckoutSession = useMutation(api.stripe.createCheckoutSession);
    const prepareBillingPortalSession = useMutation(api.stripe.prepareBillingPortalSession);
    const createStripeBillingPortalSession = useAction(api.stripe.createStripeBillingPortalSession);

    const currency: CurrencyType = CURRENCIES.USD;

    async function handleCreateCheckoutSession() {
        if (!user._id || !selectedPlanId || !prices) return;

        try {
            const price = prices.find(p => p.productId === selectedPlanId && p.interval === selectedInterval);

            if (!price) {
                throw new Error("Selected price not found");
            }

            const { sessionId } = await createCheckoutSession({
                userId: user._id,
                priceId: price.stripeId,
                quantity: 1,
                metadata: {
                    workspaceId: workspace._id,
                },
            });

            router.push(`https://checkout.stripe.com/c/pay/${sessionId}`);
        } catch (error) {
            console.error("Error creating checkout session:", error);
        }
    };

    async function handleCreateBillingPortalSession() {
        if (!user._id) return;
        try {
            const { stripeCustomerId } = await prepareBillingPortalSession({ userId: user._id });
            if (!stripeCustomerId) throw new Error('No stripe customer ID')
            const { url } = await createStripeBillingPortalSession({ stripeCustomerId });
            if (url) window.location.href = url;
        } catch (error) {
            console.error("Error creating billing portal session:", error);
        }
    };

    if (!user || !workspace || !products || !prices) return null;

    return (
        <div className="flex flex-col gap-6 w-full h-full">

            <>
                {/* Plans */}
                <div className="flex flex-col items-start bg-white border rounded-lg w-full">
                    <div className="flex flex-col gap-2 p-6">
                        <h2 className="font-medium text-xl">Plan for {workspace.name}</h2>
                        <p className="text-gray-600 text-sm">
                            Current plan:{" "}
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded-md font-medium text-sm">
                                {workspace.planType}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col justify-evenly items-center gap-2 p-6 pt-0 w-full">
                        {products.map((product) => {
                            const price = prices.find(p => p.productId === product._id && p.interval === selectedInterval);
                            return (
                                <div
                                    key={product._id}
                                    className={`flex w-full items-center rounded-md border p-4 ${selectedPlanId === product._id ? "border-blue-500" : "border-gray-200"
                                        }`}
                                    onClick={() => setSelectedPlanId(product._id)}
                                >
                                    <div className="flex flex-col items-start w-full">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-base">{product.name}</span>
                                            {price && (
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded-md text-sm">
                                                    {currency === CURRENCIES.USD ? "$" : "€"}{" "}
                                                    {price.unitAmount / 100} / {price.interval}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm">{product.description}</p>
                                    </div>

                                    {product.name !== "Free" && (
                                        <div className="flex items-center gap-2">
                                            <label htmlFor="interval-switch" className="text-gray-600 text-sm">
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

                    <div className="flex justify-between items-center bg-gray-50 p-6 border-t rounded-lg w-full">
                        <p className="text-gray-600 text-sm">
                            You will not be charged for testing the subscription upgrade.
                        </p>
                        <Button onClick={handleCreateCheckoutSession} disabled={selectedPlanId === workspace.planType}>
                            {workspace.planType === PLANS.FREE ? "Upgrade Plan" : "Change Plan"}
                        </Button>
                    </div>
                </div>

                {/* Manage Subscription */}
                <div className="flex flex-col items-start bg-white border rounded-lg w-full">
                    <div className="flex flex-col gap-2 p-6">
                        <h2 className="font-medium text-xl">Manage Subscription for {workspace.name}</h2>
                        <p className="text-gray-600 text-sm">
                            Update your payment method, billing address, and more.
                        </p>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-6 border-t rounded-lg w-full">
                        <p className="text-gray-600 text-sm">
                            You will be redirected to the Stripe Customer Portal.
                        </p>
                        <Button onClick={handleCreateBillingPortalSession}>Manage</Button>
                    </div>
                </div>
            </>
        </div>
    );
}