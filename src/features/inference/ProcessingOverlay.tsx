import { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Loader2 } from 'lucide-react';
import type { InferenceStatus } from '@/types';

interface ProcessingOverlayProps {
    status: InferenceStatus;
    progress: number;
    statusText: string;
    onComplete: () => void;
}

export function ProcessingOverlay({
    status,
    progress,
    statusText,
    onComplete,
}: ProcessingOverlayProps) {
    // Auto-navigate on completion
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(onComplete, 600);
            return () => clearTimeout(timer);
        }
    }, [status, onComplete]);

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
            role="alertdialog"
            aria-busy={status === 'loading'}
            aria-label="Processing inference"
        >
            {/* Privacy badge */}
            <Badge
                variant="outline"
                className="absolute top-6 right-6 border-emerald-600 text-emerald-600"
            >
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                Local Processing: A17 Pro ANE
            </Badge>

            {/* Animated icon */}
            <div className="relative mb-8">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
            </div>

            {/* Status text */}
            <p
                className="text-lg font-medium text-foreground mb-2"
                aria-live="polite"
            >
                {statusText}
            </p>

            {/* Progress bar */}
            <div className="w-64 sm:w-80">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center mt-2">
                    {Math.round(progress)}%
                </p>
            </div>

            {/* Error fallback */}
            {status === 'error' && (
                <p className="mt-6 text-destructive text-sm" role="alert">
                    Inference failed. Please retake the image and try again.
                </p>
            )}
        </div>
    );
}
