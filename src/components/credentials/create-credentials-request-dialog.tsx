import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { CredentialsRequestForm } from "./credentials-request-form"

export function CreateCredentialsRequestDialog() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">New credentials request</Button>
            </DialogTrigger>
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Create Credentials Request</DialogTitle>
                    <DialogDescription>
                        Create a new credentials request form. Add as many fields as you need.
                    </DialogDescription>
                </DialogHeader>
                <CredentialsRequestForm
                    setIsOpen={setIsOpen}
                    onRequestCreated={() => setIsOpen(false)}
                    onDialogClose={() => setIsOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}