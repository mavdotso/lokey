import { Separator } from "@/components/ui/separator";
import { CogIcon, UsersIcon, WalletIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const settingsItems = [
    { tabName: 'general', icon: CogIcon, name: 'General' },
    { tabName: 'users', icon: UsersIcon, name: 'Users' },
    { tabName: 'billing', icon: WalletIcon, name: 'Billing' },
];

export default function SettingsPage() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center px-8 py-6">
                <h1 className="font-bold text-2xl">Settings</h1>
            </div>
            <Separator />
            <div className="flex gap-4 px-8 py-4 w-full h-full">
                <Tabs defaultValue="general" orientation="horizontal" className="flex gap-6 w-full h-full">
                    {/* Sidebar for Tabs */}
                    <TabsList className="flex flex-col justify-start items-start gap-1 bg-transparent p-4 w-1/5 h-full text-left">
                        <p className="text-left text-muted-foreground text-sm">Workspace settings</p>
                        {settingsItems.map((item) => (
                            <TabsTrigger value={item.tabName} key={item.name} className="flex justify-start gap-2 hover:bg-muted data-[state=active]:bg-muted py-2 w-full data-[state=active]:shadomw-none font-normal text-left text-primary">
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Content Area */}
                    <div className="w-4/5">
                        <TabsContent value="general">
                            <h2 className="font-bold text-lg">General Settings</h2>
                            <p>Here you can adjust general settings for your workspace.</p>
                        </TabsContent>
                        <TabsContent value="users">
                            <h2 className="font-bold text-lg">User Management</h2>
                            <p>Manage the users for your workspace here.</p>
                        </TabsContent>
                        <TabsContent value="billing">
                            <h2 className="font-bold text-lg">Billing</h2>
                            <p>Manage the billing for your workspace here.</p>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
