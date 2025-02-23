import { CredentialsDialog } from "@/components/credentials/credentials-dialog"
import { Button } from "@/components/ui/button"
import { Share2Icon, InboxIcon } from "lucide-react"
import { useCredentialsManagement } from "@/hooks/use-credentials-management"

export function CredentialsActionButtons() {
    const { state, actions } = useCredentialsManagement()

    return (
        <>
            <CredentialsDialog
                isOpen={state.isCreateDialogOpen}
                setIsOpen={() => actions.setDialogOpen('create', !state.isCreateDialogOpen)}
                formType="new"
            >
                <Button variant="outline" className="gap-2">
                    <Share2Icon className="w-4 h-4" />
                    Share credentials
                </Button>
            </CredentialsDialog>

            <CredentialsDialog
                isOpen={state.isRequestDialogOpen}
                setIsOpen={() => actions.setDialogOpen('request', !state.isRequestDialogOpen)}
                formType="request"
            >
                <Button className="gap-2">
                    <InboxIcon className="w-4 h-4" />
                    Request credentials
                </Button>
            </CredentialsDialog>
        </>
    )
}