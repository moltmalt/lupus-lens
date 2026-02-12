// Target genes for the 20-gene expression panel
export const GENE_PANEL = [
    'IFI27', 'IFI44L', 'IFIT1', 'ISG15', 'RSAD2',
    'SIGLEC1', 'USP18', 'LY6E', 'OAS1', 'OAS3',
    'MX1', 'EPSTI1', 'HERC5', 'LAMP3', 'IFI44',
    'OASL', 'CMPK2', 'PLSCR1', 'SPATS2L', 'DDX60',
] as const;

export const REQUIRED_GENE_COUNT = 20;

// Routes
export const ROUTES = {
    DASHBOARD: '/',
    CAPTURE: '/capture',
    PATIENT_PROFILE: '/patients/:patientId',
} as const;

// Risk thresholds
export const RISK_THRESHOLDS = {
    HIGH: 70,
    MODERATE: 40,
} as const;

// Processing status messages (cycled during inference)
export const INFERENCE_STATUS_MESSAGES = [
    'Initializing Swin-SNN model…',
    'Processing retinal features…',
    'Analyzing gene expression…',
    'Fusing multimodal signals…',
    'Computing SLE risk score…',
] as const;
