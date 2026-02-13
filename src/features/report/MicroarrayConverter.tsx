import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, RefreshCw, Grid3X3, ArrowRightLeft } from 'lucide-react';

const GRID_ROWS = 4;
const GRID_COLS = 5;
const TOTAL_GENES = 20;

// Default values provided in the user request
const DEFAULT_VALUES = [
    2.32, 2.14, 3.27, 2.10, 2.20, // Row A
    3.20, 1.89, 1.52, 2.48, 4.39, // Row B
    2.15, 2.79, 2.39, 1.25, 2.49, // Row C
    1.25, 1.91, 2.17, 1.97, 1.62  // Row D
];

interface MicroarrayConverterProps {
    values?: number[];
    onValuesChange?: (values: number[]) => void;
    variant?: 'default' | 'compact';
}

export function MicroarrayConverter({
    values: externalValues,
    onValuesChange,
    variant = 'default'
}: MicroarrayConverterProps) {
    const [localValues, setLocalValues] = useState<number[]>(DEFAULT_VALUES);

    // Use external values if provided, otherwise local state
    // We pad with zeros if external values are provided but incomplete, or just use what we have? 
    // The Python logic expects 20 items. Let's fill with 0 if missing.
    const activeValues = externalValues || localValues;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // ── Logic: Generate Microarray ───────────────────────────────────────────
    const generateMicroarray = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Python logic: 400x500
        canvas.width = 500;
        canvas.height = 400;

        // Fill black background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Fill black background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // If we have fewer than 20 values, we can still plot them, or fill the rest with black.
        // Let's iterate up to TOTAL_GENES.
        for (let i = 0; i < TOTAL_GENES; i++) {
            const val = activeValues[i] || 0;
            // Normalize: 0.0 -> 5.0 => 0 -> 255
            const norm = Math.min(255, Math.max(0, (val / 5.0) * 255));
            const intensity = Math.round(norm);

            // Grid position
            const r = Math.floor(i / GRID_COLS);
            const c = i % GRID_COLS;

            const x = (c * 100) + 50;
            const y = (r * 100) + 50;

            // Draw circle
            ctx.beginPath();
            ctx.arc(x, y, 35, 0, 2 * Math.PI);
            // Color: Pure red (R, G, B) -> (intensity, 0, 0)
            ctx.fillStyle = `rgb(${intensity}, 0, 0)`;
            ctx.fill();
            ctx.fillStyle = `rgb(${intensity}, 0, 0)`;
            ctx.fill();
        }

        const url = canvas.toDataURL('image/png');
        setPreviewUrl(url);
    };

    // Auto-generate on mount or value change
    useEffect(() => {
        generateMicroarray();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeValues]);

    // ── Logic: Analyze Microarray ────────────────────────────────────────────
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                analyzeImage(img);
            };
            img.src = event.target?.result as string;
            setPreviewUrl(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const analyzeImage = (img: HTMLImageElement) => {
        const canvas = document.createElement('canvas'); // Off-screen canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Using the same dimensions as generation for simplicity, but we should adapt to image size
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const newValues: number[] = [];
        const stepX = Math.floor(canvas.width / GRID_COLS);
        const stepY = Math.floor(canvas.height / GRID_ROWS);

        for (let i = 0; i < TOTAL_GENES; i++) {
            const r = Math.floor(i / GRID_COLS);
            const c = i % GRID_COLS;

            // Center of the spot
            const cx = (c * stepX) + Math.floor(stepX / 2);
            const cy = (r * stepY) + Math.floor(stepY / 2);

            // ROI: +/- 20 pixels
            // Ensure bounds
            const startX = Math.max(0, cx - 20);
            const startY = Math.max(0, cy - 20);
            const paramW = Math.min(canvas.width - startX, 40);
            const paramH = Math.min(canvas.height - startY, 40);

            const imageData = ctx.getImageData(startX, startY, paramW, paramH);
            const data = imageData.data;

            let sumRed = 0;
            let count = 0;

            // Loop through pixels defined by ROI
            for (let j = 0; j < data.length; j += 4) {
                sumRed += data[j]; // R is at index 0 in ImageData (RGBA)
                count++;
            }

            const meanRed = count > 0 ? sumRed / count : 0;

            // Denormalize: (val / 255.0) * 5.0
            const geneVal = (meanRed / 255.0) * 5.0;
            newValues.push(Number(geneVal.toFixed(2))); // Round to 2 decimals
        }

        if (onValuesChange) {
            onValuesChange(newValues);
        } else {
            setLocalValues(newValues);
        }
    };

    const handleValueChange = (index: number, val: string) => {
        const num = parseFloat(val);
        const newValues = [...localValues];
        newValues[index] = isNaN(num) ? 0 : num;
        setLocalValues(newValues);
    };

    // ── Compact variant (for Capture Hub) ──────────────────────────────────
    if (variant === 'compact') {
        return (
            <div className="space-y-2">
                {/* Full-width preview */}
                <div className="relative bg-black rounded overflow-hidden border border-border w-full" style={{ aspectRatio: '5 / 4' }}>
                    <canvas ref={canvasRef} className="hidden" />
                    {previewUrl ? (
                        <img src={previewUrl} alt="Microarray" className="w-full h-full object-contain" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs">
                            No data
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-1.5">
                    <div className="relative">
                        <Button 
                            size="sm" 
                            className="w-full cursor-pointer relative overflow-hidden text-xs h-8 hover:opacity-90"
                            style={{ backgroundColor: '#6243FC', color: 'white' }}
                        >
                            <Upload className="mr-1.5 h-3.5 w-3.5" style={{ color: 'white' }} />
                            Upload Microarray
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImageUpload}
                            />
                        </Button>
                    </div>
                    {previewUrl && (
                        <a href={previewUrl} download="microarray.png" className="block">
                            <Button 
                                size="sm" 
                                className="w-full text-xs h-8 hover:opacity-90"
                                style={{ backgroundColor: '#6243FC', color: 'white' }}
                            >
                                <Download className="mr-1.5 h-3.5 w-3.5" style={{ color: 'white' }} />
                                Save Image
                            </Button>
                        </a>
                    )}
                </div>
            </div>
        );
    }

    // ── Default variant (for Patient Profile) ────────────────────────────────
    return (
        <Card className="w-full [&_*::selection]:bg-[#6243FC] [&_*::selection]:text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Grid3X3 className="h-5 w-5" style={{ color: '#6243FC' }} />
                    Microarray Converter
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Convert between 20-gene expression vectors and synthetic microarray images.
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Inputs */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Gene Expression (Log2FC)</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocalValues(DEFAULT_VALUES)}
                                className="h-7 text-xs"
                            >
                                <RefreshCw className="mr-1.5 h-3 w-3" style={{ color: '#6243FC' }} />
                                Reset Default
                            </Button>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            {activeValues.map((val, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <Label className="text-[10px] text-muted-foreground text-center">
                                        {String.fromCharCode(65 + Math.floor(i / 5))}{i % 5 + 1}
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="h-8 px-1 text-center text-xs focus-visible:ring-1 focus-visible:ring-[#6243FC]"
                                        value={val}
                                        onChange={(e) => handleValueChange(i, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button 
                                className="flex-1 hover:opacity-90" 
                                onClick={generateMicroarray}
                                style={{ backgroundColor: '#6243FC' }}
                            >
                                <ArrowRightLeft className="mr-2 h-4 w-4" style={{ color: 'white' }} />
                                Generate Image
                            </Button>
                            <div className="relative">
                                <Button 
                                    variant="secondary" 
                                    className="w-full cursor-pointer relative overflow-hidden hover:opacity-90"
                                    style={{ backgroundColor: '#166534', color: '#ffffff' }}
                                >
                                    <Upload className="mr-2 h-4 w-4" style={{ color: '#ffffff' }} />
                                    Import Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageUpload}
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="flex flex-col items-center justify-center space-y-4 bg-muted/20 rounded-lg p-4 border border-dashed">
                        <h3 className="text-sm font-medium text-muted-foreground self-start w-full flex justify-between">
                            Microarray Preview
                            {previewUrl && (
                                <a href={previewUrl} download="microarray.png" className="text-xs hover:underline flex items-center" style={{ color: '#6243FC' }}>
                                    <Download className="mr-1 h-3 w-3" style={{ color: '#6243FC' }} /> Save
                                </a>
                            )}
                        </h3>

                        <div className="relative bg-black rounded shadow-sm overflow-hidden shrink-0" style={{ width: 250, height: 200 }}>
                            <canvas ref={canvasRef} className="hidden" />
                            {previewUrl ? (
                                <img src={previewUrl} alt="Microarray" className="w-full h-full object-contain" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs">
                                    No Image Generated
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground text-center max-w-[280px]">
                            Generated synthetic microarray visualization based on the 20 gene expression values.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
