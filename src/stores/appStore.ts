import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { parseGeneVector } from '@/lib/validators';
import { REQUIRED_GENE_COUNT, GENE_PANEL } from '@/lib/constants';
import { predictAndExplain } from '@/lib/api';
import { uploadScanImage } from '@/lib/supabase';
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
                const { imageBlob, parsedGenes, selectedPatientId } = get();
                if (!imageBlob || parsedGenes.length !== REQUIRED_GENE_COUNT || !selectedPatientId) return;

                set({ status: 'loading', progress: 5, statusText: 'Uploading retinal image…' });

                try {
                    // 1) Upload retinal image to Supabase Storage
                    const imageUrl = await uploadScanImage(imageBlob, 'retinal.png');
                    set({ progress: 15, statusText: 'Connecting to Swin-SNN model…' });

                    // 2) Call HuggingFace model
                    const geneString = parsedGenes.join(', ');
                    set({ progress: 25, statusText: 'Running Swin-SNN inference…' });

                    const result = await predictAndExplain(imageBlob, geneString);
                    set({ progress: 85, statusText: 'Saving results…' });

                    // 3) Extract risk score from model output
                    const sleConfidence = result.confidences.find(
                        (c) => c.label.toUpperCase().includes('SLE')
                    );
                    const riskScore = Math.round(
                        (sleConfidence ? sleConfidence.confidence : result.rawScore) * 100
                    );

                    const topConfidence = Math.max(
                        ...result.confidences.map((c) => c.confidence)
                    );

                    const contributions: GeneContribution[] = parsedGenes.map((v, i) => ({
                        gene: GENE_PANEL[i] ?? `Gene${i + 1}`,
                        value: v,
                        contribution: v,
                    }));

                    // 4) Save assessment to Supabase via patient store
                    await usePatientStore.getState().addAssessment(selectedPatientId, {
                        riskScore,
                        confidence: parseFloat(topConfidence.toFixed(2)),
                        imageUrl,
                        gradCamUrl: result.heatmapUrl,
                        geneVector: parsedGenes,
                        geneContributions: contributions,
                    });

                    // 5) Also update patient status to completed
                    await usePatientStore.getState().updatePatient(selectedPatientId, {
                        status: 'completed',
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
