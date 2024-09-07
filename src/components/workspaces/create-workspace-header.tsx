import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleFadingPlus } from 'lucide-react';

export default function CreateWorkspaceHeader() {
    return (
        <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
                <div className="bg-muted p-2 rounded-full">
                    <CircleFadingPlus className="w-5 h-5 text-muted-foreground" />
                </div>
            </div>
            <CardTitle className="font-bold text-2xl">Create a workspace</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
                <a href="#" className="underline">What is a workspace?</a>
            </CardDescription>
        </CardHeader>
    );
}