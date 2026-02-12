import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export function PrivacyBadge() {
    return (
        <Badge
            variant="outline"
            className="border-emerald-600 text-emerald-600 gap-1.5 text-xs"
        >
            <ShieldCheck className="h-3.5 w-3.5" />
            Local Processing: A17 Pro ANE
        </Badge>
    );
}
