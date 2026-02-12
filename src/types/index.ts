// ── Patient ──────────────────────────────────────────
export type PatientStatus = 'pending' | 'completed';
export type RiskLevel = 'low' | 'moderate' | 'high';

export interface Patient {
    id: string;
    code: string;
    createdAt: string;
    status: PatientStatus;
    clinicianNotes: string;
    assessments: Assessment[];
}

export interface Assessment {
    id: string;
    timestamp: string;
    riskScore: number;
    confidence: number;
    imageUrl: string | null;
    gradCamUrl: string | null;
    geneVector: number[];
    geneContributions: GeneContribution[];
}

export interface GeneContribution {
    gene: string;
    value: number;
    contribution: number;
}

// ── Capture (session-level state) ────────────────────
export interface CaptureState {
    selectedPatientId: string | null;
    imageBlob: Blob | null;
    imagePreviewUrl: string | null;
    isCaptured: boolean;
    captureImage: (blob: Blob) => void;
    retake: () => void;
    selectPatient: (id: string | null) => void;
}

// ── Transcriptomics ──────────────────────────────────
export interface TranscriptomicsState {
    rawInput: string;
    parsedGenes: number[];
    geneCount: number;
    isComplete: boolean;
    setRawInput: (val: string) => void;
    pasteFromClipboard: () => Promise<void>;
}

// ── Inference ────────────────────────────────────────
export type InferenceStatus = 'idle' | 'loading' | 'success' | 'error';

export interface InferenceState {
    status: InferenceStatus;
    progress: number;
    statusText: string;
    startInference: () => Promise<void>;
    resetInference: () => void;
}

// ── Combined session store ───────────────────────────
export type SessionState = CaptureState & TranscriptomicsState & InferenceState;

// ── Patient Store ────────────────────────────────────
export interface PatientStoreState {
    patients: Patient[];
    addPatient: (code: string, notes?: string) => string;
    updatePatient: (id: string, data: Partial<Pick<Patient, 'code' | 'status' | 'clinicianNotes'>>) => void;
    deletePatient: (id: string) => void;
    addAssessment: (patientId: string, assessment: Assessment) => void;
    getPatient: (id: string) => Patient | undefined;
}

// ── Scan History (legacy compat) ─────────────────────
export interface ScanRecord {
    id: string;
    patientId: string;
    riskScore: number;
    timestamp: string;
}
