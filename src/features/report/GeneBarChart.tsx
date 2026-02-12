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

function getBarColor(contribution: number): string {
    if (contribution >= 0.5) return '#ef4444';
    if (contribution >= 0) return '#f59e0b';
    return '#10b981';
}

export function GeneBarChart({ data, maxBars = 20 }: GeneBarChartProps) {
    const sorted = [...data]
        .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
        .slice(0, maxBars);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                    <Dna className="h-4 w-4 text-primary" />
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
                                {sorted.map((entry, i) => (
                                    <Cell key={i} fill={getBarColor(entry.contribution)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
