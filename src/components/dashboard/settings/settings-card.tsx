import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction } from "react";

export interface SettingsCardProps {
    title: string,
    description: string | React.ReactNode,
    inputValue?: string,
    setInputValue?: Dispatch<SetStateAction<string>>,
    inputPlaceholder?: string,
    isInputRequired?: boolean,
    onSave?: () => void,
    isDangerous?: boolean,
    buttonText?: string,
    footerText?: string,
    children?: React.ReactNode,
}

export function SettingsCard({
    title,
    description,
    inputValue,
    setInputValue,
    inputPlaceholder,
    isInputRequired,
    onSave,
    isDangerous = false,
    buttonText = "Save changes",
    footerText,
    children,
}: SettingsCardProps) {
    return (
        <Card className={`shadow-none overflow-hidden ${isDangerous ? 'border-destructive' : ''}`}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {children ? children : (
                    <Input
                        placeholder={inputPlaceholder}
                        value={inputValue}
                        onChange={(e) => setInputValue?.(e.target.value)}
                        required={isInputRequired}
                    />
                )}
            </CardContent>
            <CardFooter className="flex justify-end items-center gap-2 bg-muted py-4">
                {footerText && <p className="mr-auto text-muted-foreground text-sm">{footerText}</p>}
                <Button
                    onClick={onSave}
                    variant={isDangerous ? "destructive" : "default"}
                >
                    {buttonText}
                </Button>
            </CardFooter>
        </Card>
    );
}