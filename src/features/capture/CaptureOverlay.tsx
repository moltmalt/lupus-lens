interface CaptureOverlayProps {
    isFocusLocked: boolean;
    ringDiameter?: number;
}

export function CaptureOverlay({ isFocusLocked, ringDiameter = 80 }: CaptureOverlayProps) {
    const color = isFocusLocked ? '#10b981' : '#ffffff';
    const strokeWidth = isFocusLocked ? 3 : 2;

    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            aria-hidden="true"
        >
            {/* Guidance ring */}
            <circle
                cx="50"
                cy="50"
                r={ringDiameter / 2}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={isFocusLocked ? 'none' : '4 2'}
                opacity={0.8}
            >
                {!isFocusLocked && (
                    <animate
                        attributeName="stroke-dashoffset"
                        values="0;12"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                )}
            </circle>

            {/* Crosshair */}
            <line x1="50" y1="42" x2="50" y2="46" stroke={color} strokeWidth="1" opacity="0.6" />
            <line x1="50" y1="54" x2="50" y2="58" stroke={color} strokeWidth="1" opacity="0.6" />
            <line x1="42" y1="50" x2="46" y2="50" stroke={color} strokeWidth="1" opacity="0.6" />
            <line x1="54" y1="50" x2="58" y2="50" stroke={color} strokeWidth="1" opacity="0.6" />

            {/* Focus locked indicator */}
            {isFocusLocked && (
                <text
                    x="50"
                    y="94"
                    textAnchor="middle"
                    fill="#10b981"
                    fontSize="3"
                    fontFamily="system-ui"
                >
                    FOCUS LOCKED
                </text>
            )}
        </svg>
    );
}
