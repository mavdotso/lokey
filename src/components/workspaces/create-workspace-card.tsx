import { Card, CardContent } from "@/components/ui/card"
import { CreateWorkspaceForm } from './create-workspace-form'
import { cn } from '@/lib/utils'
import CreateWorkspaceHeader from './create-workspace-header'

type CreateWorkspaceCardProps = {
    className?: string;
}

export function CreateWorkspaceCard({ className }: CreateWorkspaceCardProps) {
    return (
        <Card className={cn('w-full max-w-lg max-h-fit overflow-hidden', className)}>
            <CreateWorkspaceHeader />
            <CardContent className="bg-muted pt-8 border-t">
                <CreateWorkspaceForm />
            </CardContent>
        </Card>
    )
}