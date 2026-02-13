import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { ClipboardPaste, CheckCircle2 } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { parseGeneVector } from '@/lib/validators';
import { REQUIRED_GENE_COUNT } from '@/lib/constants';

interface VectorInputProps {
    value: string;
    onChange: (raw: string) => void;
    onPaste: () => Promise<void>;
    parsedCount: number;
    isComplete: boolean;
}

export function VectorInput({
    value,
    onChange,
    onPaste,
    parsedCount,
    isComplete,
}: VectorInputProps) {
    const [error, setError] = useState<string | null>(null);
    const { vibrate } = useHaptics();

    const handleChange = (raw: string) => {
        const result = parseGeneVector(raw);
        if (result.error) {
            setError(result.error);
        } else {
            setError(null);
            if (result.count === REQUIRED_GENE_COUNT && parsedCount < REQUIRED_GENE_COUNT) {
                vibrate([50, 30, 50]);
            }
        }
        onChange(raw);
    };

    const progressPercent = (parsedCount / REQUIRED_GENE_COUNT) * 100;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="gene-input">Gene Expression Vector</Label>
                <Badge
                    variant={isComplete ? 'default' : 'secondary'}
                    className={cn('text-xs', isComplete ? 'bg-emerald-600 hover:bg-emerald-700' : '')}
                >
                    {isComplete && <CheckCircle2 className="h-3 w-3 mr-0.5" />}
                    {parsedCount}/{REQUIRED_GENE_COUNT}
                </Badge>
            </div>

            {/* Progress bar */}
            <div className="progress-purple">
                <Progress value={progressPercent} className="h-1.5" />
            </div>
            <style>{`
                .progress-purple .bg-primary {
                    background-color: #6243FC !important;
                }
            `}</style>

            <Textarea
                id="gene-input"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Paste 20 comma-separated gene expression values…
e.g. 0.82, 1.34, 0.21, 1.56, 0.93, 1.12, 0.45, 0.78, 1.23, 0.67, 1.45, 0.89, 1.01, 0.56, 1.78, 0.34, 0.91, 1.23, 0.65, 1.11"
                rows={4}
                className={cn(
                    'font-mono text-xs focus-visible:ring-1 focus-visible:ring-[#6243FC] bg-[#B7A9FD]/20',
                    isComplete
                        ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                        : error
                            ? 'border-destructive'
                            : ''
                )}
                aria-label="Gene expression values, comma-separated"
                aria-invalid={!!error}
                aria-describedby={error ? 'gene-error' : undefined}
            />

            {error && (
                <p id="gene-error" className="text-xs text-destructive" role="alert">
                    {error}
                </p>
            )}

            <Button 
                variant="outline" 
                size="default" 
                onClick={onPaste} 
                className="w-full border-[#6243FC]"
            >
                <ClipboardPaste className="h-4 w-4 mr-1.5" style={{ color: '#6243FC' }} />
                Paste from Clipboard
            </Button>
        </div>
    );
}
