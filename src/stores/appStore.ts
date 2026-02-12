import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { parseGeneVector } from '@/lib/validators';
import { REQUIRED_GENE_COUNT, GENE_PANEL } from '@/lib/constants';
import { predictAndExplain } from '@/lib/api';
import type { SessionState, GeneContribution } from '@/types';
import { usePatientStore } from './patientStore';

export const useSessionStore = create<SessionState>()(
    devtools(
        (set, get) => ({
            // ── Patient selection ─────────────────────────────
            selectedPatientId: null,
            selectPatient: (id) => set({ selectedPatientId: id }),

            // ── Capture ───────────────────────────────────────
            imageBlob: null,
            imagePreviewUrl: null,
            isCaptured: false,
            captureImage: (blob: Blob) => {
                const url = URL.createObjectURL(blob);
                set({ imageBlob: blob, imagePreviewUrl: url, isCaptured: true });
            },
            retake: () => {
                const prev = get().imagePreviewUrl;
                if (prev) URL.revokeObjectURL(prev);
                set({ imageBlob: null, imagePreviewUrl: null, isCaptured: false });
            },

            // ── Transcriptomics ───────────────────────────────
            rawInput: '',
            parsedGenes: [],
            geneCount: 0,
            isComplete: false,
            setRawInput: (val: string) => {
                const result = parseGeneVector(val);
                set({
                    rawInput: val,
                    parsedGenes: result.values,
                    geneCount: result.count,
                    isComplete: result.count === REQUIRED_GENE_COUNT,
                });
            },
            pasteFromClipboard: async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    get().setRawInput(text);
                } catch {
                    // Clipboard access denied
                }
            },

            // ── Inference ─────────────────────────────────────
            status: 'idle',
            progress: 0,
            statusText: '',
            startInference: async () => {
                const { imageBlob, parsedGenes, selectedPatientId, imagePreviewUrl } = get();
                if (!imageBlob || parsedGenes.length !== REQUIRED_GENE_COUNT || !selectedPatientId) return;

                set({ status: 'loading', progress: 10, statusText: 'Connecting to Swin-SNN model…' });

                try {
                    // Build comma-separated gene string
                    const geneString = parsedGenes.join(', ');

                    set({ progress: 20, statusText: 'Uploading retinal image…' });

                    const result = await predictAndExplain(imageBlob, geneString);

                    set({ progress: 90, statusText: 'Processing results…' });

                    // Extract risk score: use the SLE confidence (or rawScore) as percentage
                    const sleConfidence = result.confidences.find(
                        (c) => c.label.toUpperCase().includes('SLE')
                    );
                    const riskScore = Math.round(
                        (sleConfidence ? sleConfidence.confidence : result.rawScore) * 100
                    );

                    // Overall model confidence (highest confidence value)
                    const topConfidence = Math.max(
                        ...result.confidences.map((c) => c.confidence)
                    );

                    // Build gene contributions from the parsed genes
                    const contributions: GeneContribution[] = parsedGenes.map((v, i) => ({
                        gene: GENE_PANEL[i] ?? `Gene${i + 1}`,
                        value: v,
                        contribution: v, // raw expression value as contribution
                    }));

                    // Save assessment to patient store
                    usePatientStore.getState().addAssessment(selectedPatientId, {
                        id: `a${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        riskScore,
                        confidence: parseFloat(topConfidence.toFixed(2)),
                        imageUrl: imagePreviewUrl,
                        gradCamUrl: result.heatmapUrl,
                        geneVector: parsedGenes,
                        geneContributions: contributions,
                    });

                    set({ status: 'success', progress: 100, statusText: 'Analysis complete' });
                } catch (err) {
                    console.error('Inference failed:', err);
                    set({
                        status: 'error',
                        progress: 0,
                        statusText: err instanceof Error ? err.message : 'Inference failed. Please try again.',
                    });
                }
            },
            resetInference: () =>
                set({ status: 'idle', progress: 0, statusText: '' }),
        }),
        { name: 'lupus-session' }
    )
);

// ── Derived Selectors ────────────────────────────────
export const useCanRunInference = () =>
    useSessionStore((s) => !!s.selectedPatientId && s.isCaptured && s.isComplete);
