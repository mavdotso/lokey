import React from 'react';
import { Badge } from '../ui/badge';

interface HashtagBadgeProps {
    text: string;
}

export function HashtagBadge({ text }: HashtagBadgeProps) {
    return (
        <Badge variant="outline" className="flex items-center gap-1">
            <span className="text-muted-foreground">#</span>
            {text}
        </Badge>
    );
}