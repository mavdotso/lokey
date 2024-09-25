import { CurrencyType, User, Workspace } from "@/convex/types";
import { CURRENCIES, PLANS } from "@/convex/schema";
import { api } from "@/convex/_generated/api";
import { SettingsCard } from "../settings-card";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/global/loading-screen";
import { fetchQuery } from "convex/nextjs";
import { BillingForm } from "./billing-form";

interface BillingSettingsProps {
    user: Partial<User>
    workspace: Workspace
}

export async function BillingSettings({ user, workspace }: BillingSettingsProps) {
    const products = await fetchQuery(api.stripe.getProducts);
    const prices = await fetchQuery(api.stripe.getPrices);

    const currency: CurrencyType = CURRENCIES.USD;

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
                footerText="You will not be charged for testing the subscription upgrade."
            >
                <BillingForm
                    user={user}
                    workspace={workspace}
                    products={products}
                    prices={prices}
                    currency={currency}
                />
            </SettingsCard>

            <SettingsCard
                title={`Manage Subscription for ${workspace.name}`}
                description="Update your payment method, billing address, and more."
                buttonText="Manage"
                footerText="You will be redirected to the Stripe Customer Portal."
            >{" "}</SettingsCard>
        </div>
    );
}