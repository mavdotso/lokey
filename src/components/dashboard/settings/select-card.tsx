import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SelectCardProps {
    title: string;
    description: string;
    options: { value: string; label: string }[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    onSave: () => void;
    isDangerous?: boolean;
    buttonText?: string;
}

export function SelectCard({
    title,
    description,
    options,
    selectedValue,
    onValueChange,
    onSave,
    isDangerous = false,
    buttonText = "Save changes",
}: SelectCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Select value={selectedValue} onValueChange={onValueChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
            <CardFooter className="flex justify-end items-center gap-2 bg-muted py-4">
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