import { Badge } from '@/components/ui/badge';
import { credentialsFields } from '@/lib/credentials-fields';

interface HashtagBadgeProps {
    text: string;
}

export function HashtagBadge({ text }: HashtagBadgeProps) {
    const label = credentialsFields[text]?.[0]?.label || text;

    return (
        <Badge variant="outline" className="flex items-center gap-1">
            <span className="text-muted-foreground">#</span>
            {label}
        </Badge>
    );
}