import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, RotateCcw } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

interface RetinaViewportProps {
    onCapture: (blob: Blob) => void;
    onRetake: () => void;
    isCaptured: boolean;
    previewUrl: string | null;
}

export function RetinaViewport({
    onCapture,
    onRetake,
    isCaptured,
    previewUrl,
}: RetinaViewportProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState(false);
    const { vibrate } = useHaptics();

    // Camera lifecycle
    useEffect(() => {
        let active = true;

        async function startCamera() {
            try {
                const s = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1024 },
                        height: { ideal: 1024 },
                    },
                });
                if (active && videoRef.current) {
                    videoRef.current.srcObject = s;
                    streamRef.current = s;
                }
            } catch {
                if (active) setCameraError(true);
            }
        }

        if (!isCaptured) {
            startCamera();
        }

        return () => {
            active = false;
            streamRef.current?.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        };
    }, [isCaptured]);



    const handleShutter = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d')!;
        const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        const sx = (videoRef.current.videoWidth - size) / 2;
        const sy = (videoRef.current.videoHeight - size) / 2;
        ctx.drawImage(videoRef.current, sx, sy, size, size, 0, 0, size, size);
        canvasRef.current.toBlob(
            (blob) => blob && onCapture(blob),
            'image/jpeg',
            0.92
        );
        vibrate(100);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onCapture(file);
        vibrate(50);
        // Reset input so the same file can be re-selected
        e.target.value = '';
    };

    // Camera error fallback — upload-only (skip if image already captured via upload)
    if (cameraError && !isCaptured) {
        return (
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted flex flex-col items-center justify-center p-6 text-center gap-3">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Camera unavailable.
                        <br />
                        Upload a retinal image instead.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-[#6243FC]"
                    >
                        <Upload className="h-4 w-4 mr-1.5" style={{ color: '#6243FC' }} />
                        Upload Image
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Camera viewport */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black">
                {isCaptured && previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Captured retinal image"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                )}


                {/* Hidden canvas for frame capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
            />

            {/* Controls — below the viewport */}
            <div className="flex justify-center gap-3 w-full">
                {isCaptured ? (
                    <Button
                        variant="outline"
                        onClick={onRetake}
                        className="gap-1.5"
                    >
                        <RotateCcw className="h-4 w-4" style={{ color: '#6243FC' }} />
                        Retake
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="gap-1.5"
                        >
                            <Upload className="h-4 w-4" style={{ color: '#6243FC' }} />
                            Upload
                        </Button>
                        <Button
                            onClick={handleShutter}
                            className="gap-1.5 hover:opacity-90"
                            style={{ backgroundColor: '#6243FC', color: 'white' }}
                        >
                            <Camera className="h-4 w-4" style={{ color: 'white' }} />
                            Capture
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
