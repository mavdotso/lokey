import { TabType } from "@/app/(app)/dashboard/[slug]/credentials/page";
import { TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TabsHeader() {
    return (
        <TabsList>
            <TabTrigger value="shared">Shared</TabTrigger>
            <TabTrigger value="requested">Requested</TabTrigger>
        </TabsList>
    )
}

function TabTrigger({ value, children }: { value: TabType; children: string }) {
    return (
        <TabsTrigger value={value} className="text-sm h-8 px-4">
            {children}
        </TabsTrigger>
    )
}