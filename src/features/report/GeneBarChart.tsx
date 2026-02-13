import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dna } from 'lucide-react';
import type { GeneContribution } from '@/types';

interface GeneBarChartProps {
    data: GeneContribution[];
    maxBars?: number;
}

// Gradient colors: light (#B7A9FD) to dark (#6243FC)
const GRADIENT_LIGHT = '#B7A9FD';
const GRADIENT_DARK = '#6243FC';

// Helper to interpolate between two hex colors
function interpolateColor(color1: string, color2: string, factor: number): string {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);
    
    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getBarColor(contribution: number, maxAbsContribution: number): string {
    // Normalize contribution to 0-1 range based on max absolute value
    const normalized = Math.min(Math.abs(contribution) / Math.max(maxAbsContribution, 0.01), 1);
    
    // Higher contribution = darker gradient (factor closer to 1)
    // Use a power curve for smoother visual progression
    const factor = Math.pow(normalized, 0.7);
    
    return interpolateColor(GRADIENT_LIGHT, GRADIENT_DARK, factor);
}

export function GeneBarChart({ data, maxBars = 20 }: GeneBarChartProps) {
    const sorted = [...data]
        .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
        .slice(0, maxBars);

    // Find the maximum absolute contribution for normalization
    const maxAbsContribution = Math.max(
        ...sorted.map((entry) => Math.abs(entry.contribution)),
        0.01
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                    <Dna className="h-4 w-4" style={{ color: '#6243FC' }} />
                    Gene Contributions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full" style={{ height: Math.max(200, sorted.length * 24) }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={sorted}
                            layout="vertical"
                            margin={{ top: 0, right: 8, bottom: 0, left: 48 }}
                        >
                            <defs>
                                {sorted.map((entry, i) => {
                                    const color = getBarColor(entry.contribution, maxAbsContribution);
                                    return (
                                        <linearGradient
                                            key={`gradient-${i}`}
                                            id={`gradient-${i}`}
                                            x1="0%"
                                            y1="0%"
                                            x2="100%"
                                            y2="0%"
                                        >
                                            <stop offset="0%" stopColor={GRADIENT_LIGHT} stopOpacity={0.8} />
                                            <stop offset="100%" stopColor={color} stopOpacity={1} />
                                        </linearGradient>
                                    );
                                })}
                            </defs>
                            <XAxis type="number" tick={{ fontSize: 12, fill: '#a1a1aa' }} />
                            <YAxis
                                type="category"
                                dataKey="gene"
                                tick={{ fontSize: 12, fill: '#a1a1aa' }}
                                width={44}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#111113',
                                    border: '1px solid #27272a',
                                    borderRadius: '6px',
                                    fontSize: 13,
                                    padding: '4px 8px',
                                }}
                                labelStyle={{ color: '#fafafa' }}
                            />
                            <Bar dataKey="contribution" radius={[0, 3, 3, 0]}>
                                {sorted.map((_, i) => (
                                    <Cell key={i} fill={`url(#gradient-${i})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
