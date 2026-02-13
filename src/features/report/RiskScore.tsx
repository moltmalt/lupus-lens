import { RISK_THRESHOLDS } from '@/lib/constants';

function getSeverity(value: number) {
    if (value >= RISK_THRESHOLDS.HIGH) return 'high' as const;
    if (value >= RISK_THRESHOLDS.MODERATE) return 'moderate' as const;
    return 'low' as const;
}

function getBoxCount(value: number): number {
    // Scale from 0-100% to 1-5 boxes based on rounding to nearest 20% increment
    // 43% → rounds to 40% → 2 boxes
    // 50% → rounds to 60% → 3 boxes
    // 100% → 5 boxes
    if (value >= 90) return 5;
    if (value >= 70) return 4;
    if (value >= 50) return 3; // 50% is nearer to 60% → 3 boxes
    if (value >= 30) return 2; // 43% is nearer to 40% → 2 boxes
    return 1;
}

export function RiskScore({ value }: { value: number }) {
    const severity = getSeverity(value);

    return (
        <div className="rounded-lg p-3 text-center border-2 border-border bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                SLE Risk Assessment
            </p>
            <p
                className="text-5xl font-extrabold mt-1"
                style={{ color: '#6243FC' }}
            >
                {value}%
            </p>
            <p className="text-base mt-0.5 capitalize font-medium flex items-center justify-center gap-1.5">
                {severity} risk
                <span className="flex gap-0.5">
                    {Array.from({ length: getBoxCount(value) }).map((_, i) => (
                        <span
                            key={i}
                            className={
                                severity === 'high'
                                    ? 'text-red-500'
                                    : severity === 'moderate'
                                        ? 'text-amber-500'
                                        : 'text-emerald-500'
                            }
                        >
                            ■
                        </span>
                    ))}
                </span>
            </p>
        </div>
    );
}
