import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface GradCamViewProps {
    originalImageUrl: string;
    heatmapUrl: string;
    initialOpacity?: number;
}

export function GradCamView({
    originalImageUrl,
    heatmapUrl,
    initialOpacity = 0.5,
}: GradCamViewProps) {
    const [opacity, setOpacity] = useState(initialOpacity);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" style={{ color: '#6243FC' }} />
                    Retinal GradCAM
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-black">
                    <img
                        src={originalImageUrl}
                        alt="Original retinal image"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <img
                        src={heatmapUrl}
                        alt="GradCAM heatmap overlay"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                            opacity,
                            mixBlendMode: 'multiply',
                            filter: 'hue-rotate(180deg) saturate(3)',
                        }}
                    />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Original</span>
                        <span>Heatmap</span>
                    </div>
                    <div className="slider-custom">
                        <Slider
                            value={[opacity * 100]}
                            onValueChange={([v]) => setOpacity(v / 100)}
                            max={100}
                            step={1}
                            aria-label="Heatmap opacity"
                        />
                    </div>
                    <style>{`
                        .slider-custom .bg-primary {
                            background-color: #6243FC !important;
                        }
                        .slider-custom .border-primary {
                            border-color: #6243FC !important;
                        }
                    `}</style>
                </div>
            </CardContent>
        </Card>
    );
}
