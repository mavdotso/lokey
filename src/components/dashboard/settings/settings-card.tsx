"use client"
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction } from "react";

export interface SettingsCardProps {
    title: string,
    description: string,
    inputValue: string,
    setInputValue: Dispatch<SetStateAction<string>>
    inputPlaceholder?: string,
    isInputRequired?: boolean,
    onSave?: () => void,
}

export function SettingsCard({ title, description, inputValue, setInputValue, inputPlaceholder, isInputRequired, onSave }: SettingsCardProps) {
    return (
        <Card className="shadow-none overflow-hidden">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Input
                    placeholder={inputPlaceholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    required={isInputRequired}
                />
            </CardContent>
            <CardFooter className="flex justify-end items-center gap-2 bg-muted py-4">
                <Button onClick={onSave}>
                    Save changes
                </Button>
            </CardFooter>
        </Card>
    );
}