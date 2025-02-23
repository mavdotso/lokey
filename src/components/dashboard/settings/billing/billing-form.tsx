'use client';

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Id } from "@/convex/_generated/dataModel";
import { CurrencyType, IntervalType, Price, Product, User, Workspace } from "@/convex/types";
import { INTERVALS, PLANS } from "@/convex/schema";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { fetchAction } from "convex/nextjs";
import { Button } from "@/components/ui/button";

interface BillingFormProps {
    user: Partial<User>;
    workspace: Workspace;
    products: Product[]
    prices: Price[]
    currency: CurrencyType;
}

export function BillingForm({ user, workspace, products, prices, currency }: BillingFormProps) {
    const [selectedPlanId, setSelectedPlanId] = useState<Id<"products"> | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<IntervalType>(INTERVALS.MONTH);

    async function handleCreateCheckoutSession() {
        if (!selectedPlanId) return;

        const selectedPrice = prices.find(
            (p) => p.productId === selectedPlanId && p.interval === selectedInterval
        );

        if (!selectedPrice) return;

        if (!user?._id) {
            throw new Error("User ID is undefined");
        }

        try {
            const { sessionId } = await fetchAction(api.stripe.createCheckoutSession, {
                userId: user._id,
                priceId: selectedPrice?._id?.toString() ?? '',
                metadata: { workspaceId: workspace._id },
            });

            if (sessionId) {
                redirect(`https://checkout.stripe.com/pay/${sessionId}`);
            }

        } catch (error) {
            console.error("Failed to create checkout session:", error);
        }
    }

    return (
        <div className="flex flex-col justify-evenly items-center gap-4 w-full">
            <div className="flex items-center space-x-2">
                <Switch
                    id="interval-toggle"
                    checked={selectedInterval === INTERVALS.YEAR}
                    onCheckedChange={(checked) =>
                        setSelectedInterval(checked ? INTERVALS.YEAR : INTERVALS.MONTH)
                    }
                />
                <label htmlFor="interval-toggle">
                    {selectedInterval === INTERVALS.YEAR ? "Yearly" : "Monthly"}
                </label>
            </div>

            {products.map((product) => {
                const price = prices.find(p => p.productId === product._id && p.interval === selectedInterval);
                return (
                    <div key={product._id}
                        className={`flex w-full items-center rounded-md border p-4 cursor-pointer transition-colors
                        ${selectedPlanId === product._id
                                ? "border-primary bg-secondary"
                                : "border-border hover:bg-muted"}`}
                        onClick={() => product._id && setSelectedPlanId(product._id)}>
                        <div className="flex flex-col grow">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-muted-foreground text-sm">{product.description}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-2xl">
                                {price ? `${currency}${price.unitAmount / 100}` : 'N/A'}
                            </span>
                            <span className="text-muted-foreground text-sm">
                                {selectedInterval === INTERVALS.MONTH ? '/month' : '/year'}
                            </span>
                        </div>
                    </div>
                );
            })}

            <Button
                onClick={handleCreateCheckoutSession}
                disabled={!selectedPlanId || workspace.planType === PLANS.TEAM}
                className="w-full"
            >
                {workspace.planType === PLANS.FREE ? "Upgrade Plan" : "Change Plan"}
            </Button>
        </div>
    );
}