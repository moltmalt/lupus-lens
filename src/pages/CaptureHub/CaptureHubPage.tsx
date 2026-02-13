import { useNavigate } from 'react-router-dom';
import { PatientSelector } from '@/features/capture/PatientSelector';
import { RetinaViewport } from '@/features/capture/RetinaViewport';
import { VectorInput } from '@/features/transcriptomics/VectorInput';
import { MicroarrayConverter } from '@/features/report/MicroarrayConverter';
import { ProcessingOverlay } from '@/features/inference/ProcessingOverlay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessionStore, useCanRunInference } from '@/stores/appStore';
import { Cpu, ScanEye, Dna, AlertTriangle, X } from 'lucide-react';

export function CaptureHubPage() {
    const navigate = useNavigate();
    const canRun = useCanRunInference();

    const {
        selectedPatientId,
        isCaptured,
        imagePreviewUrl,
        captureImage,
        retake,
        rawInput,
        setRawInput,
        pasteFromClipboard,
        geneCount,
        parsedGenes,
        isComplete,
        status,
        progress,
        statusText,
        startInference,
        resetInference,
    } = useSessionStore();

    const handleRunInference = async () => {
        await startInference();
    };

    const handleInferenceComplete = () => {
        resetInference();
        if (selectedPatientId) {
            navigate(`/patients/${selectedPatientId}`);
        }
    };

    // Full-screen processing overlay
    if (status === 'loading' || status === 'success') {
        return (
            <ProcessingOverlay
                status={status}
                progress={progress}
                statusText={statusText}
                onComplete={handleInferenceComplete}
            />
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-2.5rem)] [&_*::selection]:bg-[#6243FC] [&_*::selection]:text-white">
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {/* Error banner */}
                {status === 'error' && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{statusText || 'Inference failed. Please try again.'}</span>
                        <button onClick={resetInference} className="shrink-0 hover:opacity-70">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
                {/* 1) Patient Selector */}
                <PatientSelector />

                {/* 2) Camera + Gene Input — side by side on md+ */}
                <div className="flex flex-col md:flex-row gap-2 md:items-stretch">
                    {/* Retina viewport */}
                    <div className="w-full md:w-1/2">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="py-1.5 px-2">
                                <CardTitle className="flex items-center gap-1.5 text-sm">
                                    <ScanEye className="h-4 w-4" style={{ color: '#6243FC' }} />
                                    Retinal Capture
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 pt-0 flex-1">
                                <RetinaViewport
                                    onCapture={captureImage}
                                    onRetake={retake}
                                    isCaptured={isCaptured}
                                    previewUrl={imagePreviewUrl}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gene input */}
                    <div className="w-full md:w-1/2">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="py-1.5 px-2">
                                <CardTitle className="flex items-center gap-1.5 text-sm">
                                    <Dna className="h-4 w-4" style={{ color: '#6243FC' }} />
                                    Gene Panel
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 pt-0 space-y-4 flex-1 flex flex-col">
                                <MicroarrayConverter
                                    variant="compact"
                                    values={parsedGenes}
                                    onValuesChange={(vals) => setRawInput(vals.join(', '))}
                                />

                                <VectorInput
                                    value={rawInput}
                                    onChange={setRawInput}
                                    onPaste={pasteFromClipboard}
                                    parsedCount={geneCount}
                                    isComplete={isComplete}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Sticky inference button */}
            <div className="p-2 border-t bg-background/80 backdrop-blur-md shrink-0">
                <Button 
                    size="lg" 
                    disabled={!canRun} 
                    onClick={handleRunInference} 
                    className="w-full hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#6243FC', color: 'white' }}
                >
                    <Cpu className="h-4 w-4 mr-1.5" style={{ color: 'white' }} />
                    Run Swin-SNN Inference
                </Button>
                {!canRun && (
                    <p className="text-xs text-muted-foreground text-center mt-1">
                        {!selectedPatientId
                            ? 'Select or create a patient'
                            : !isCaptured
                                ? 'Capture a retinal image'
                                : 'Enter all 20 gene expression values'}
                    </p>
                )}
            </div>
        </div>
    );
}
