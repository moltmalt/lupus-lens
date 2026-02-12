import { cn } from '@/lib/utils';
import { RISK_THRESHOLDS } from '@/lib/constants';

function getSeverity(value: number) {
    if (value >= RISK_THRESHOLDS.HIGH) return 'high' as const;
    if (value >= RISK_THRESHOLDS.MODERATE) return 'moderate' as const;
    return 'low' as const;
}

export function RiskScore({ value }: { value: number }) {
    const severity = getSeverity(value);

    return (
        <div
            className="rounded-lg p-3 text-center"
            style={{
                backgroundColor:
                    severity === 'high'
                        ? 'color-mix(in srgb, #ef4444 15%, var(--bg))'
                        : severity === 'moderate'
                            ? 'color-mix(in srgb, #f59e0b 15%, var(--bg))'
                            : 'color-mix(in srgb, #10b981 15%, var(--bg))',
            }}
        >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                SLE Risk Assessment
            </p>
            <p
                className={cn(
                    'text-5xl font-extrabold mt-1',
                    severity === 'high' && 'text-red-500',
                    severity === 'moderate' && 'text-amber-500',
                    severity === 'low' && 'text-emerald-500'
                )}
            >
                {value}%
            </p>
            <p className="text-sm mt-0.5 text-muted-foreground capitalize">
                {severity} risk
            </p>
        </div>
    );
}
