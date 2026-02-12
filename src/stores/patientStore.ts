import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Patient, Assessment, PatientStoreState } from '@/types';

// ── Mock seed data ───────────────────────────────────
const SEED_PATIENTS: Patient[] = [
    {
        id: 'p1',
        code: 'PT0042',
        createdAt: '2026-01-15T08:00:00',
        status: 'completed',
        clinicianNotes: 'Follow-up in 3 months. Monitor IFN signature.',
        assessments: [
            {
                id: 'a1',
                timestamp: '2026-02-12T09:15:00',
                riskScore: 87,
                confidence: 0.94,
                imageUrl: null,
                gradCamUrl: null,
                geneVector: [0.82, 1.34, 0.21, 1.56, 0.93, 1.12, 0.45, 0.78, 1.23, 0.67, 1.45, 0.89, 1.01, 0.56, 1.78, 0.34, 0.91, 1.23, 0.65, 1.11],
                geneContributions: [
                    { gene: 'IFI27', value: 0.82, contribution: 0.85 },
                    { gene: 'IFI44L', value: 1.34, contribution: 0.72 },
                    { gene: 'IFIT1', value: 0.21, contribution: -0.15 },
                    { gene: 'ISG15', value: 1.56, contribution: 0.91 },
                    { gene: 'RSAD2', value: 0.93, contribution: 0.45 },
                ],
            },
            {
                id: 'a0',
                timestamp: '2026-01-20T14:30:00',
                riskScore: 72,
                confidence: 0.88,
                imageUrl: null,
                gradCamUrl: null,
                geneVector: [],
                geneContributions: [],
            },
        ],
    },
    {
        id: 'p2',
        code: 'PT0039',
        createdAt: '2026-01-20T10:30:00',
        status: 'completed',
        clinicianNotes: 'Low risk. Routine check.',
        assessments: [
            {
                id: 'a2',
                timestamp: '2026-02-11T14:30:00',
                riskScore: 23,
                confidence: 0.91,
                imageUrl: null,
                gradCamUrl: null,
                geneVector: [],
                geneContributions: [
                    { gene: 'IFI27', value: 0.32, contribution: -0.21 },
                    { gene: 'IFI44L', value: 0.44, contribution: -0.15 },
                    { gene: 'IFIT1', value: 0.51, contribution: 0.08 },
                ],
            },
        ],
    },
    {
        id: 'p3',
        code: 'PT0041',
        createdAt: '2026-02-01T09:00:00',
        status: 'pending',
        clinicianNotes: '',
        assessments: [
            {
                id: 'a3',
                timestamp: '2026-02-11T11:45:00',
                riskScore: 52,
                confidence: 0.78,
                imageUrl: null,
                gradCamUrl: null,
                geneVector: [],
                geneContributions: [],
            },
        ],
    },
    {
        id: 'p4',
        code: 'PT0038',
        createdAt: '2026-01-10T12:00:00',
        status: 'completed',
        clinicianNotes: 'Referred to rheumatology.',
        assessments: [
            {
                id: 'a4',
                timestamp: '2026-02-10T16:20:00',
                riskScore: 91,
                confidence: 0.97,
                imageUrl: null,
                gradCamUrl: null,
                geneVector: [],
                geneContributions: [
                    { gene: 'IFI27', value: 1.89, contribution: 0.95 },
                    { gene: 'ISG15', value: 1.72, contribution: 0.88 },
                    { gene: 'RSAD2', value: 1.45, contribution: 0.76 },
                    { gene: 'MX1', value: 1.33, contribution: 0.65 },
                    { gene: 'OAS1', value: 0.22, contribution: -0.31 },
                ],
            },
        ],
    },
];

let nextId = 5;

export const usePatientStore = create<PatientStoreState>()(
    devtools(
        (set, get) => ({
            patients: SEED_PATIENTS,

            addPatient: (code, notes = '') => {
                const id = `p${nextId++}`;
                const patient: Patient = {
                    id,
                    code,
                    createdAt: new Date().toISOString(),
                    status: 'pending',
                    clinicianNotes: notes,
                    assessments: [],
                };
                set((s) => ({ patients: [patient, ...s.patients] }));
                return id;
            },

            updatePatient: (id, data) => {
                set((s) => ({
                    patients: s.patients.map((p) =>
                        p.id === id ? { ...p, ...data } : p
                    ),
                }));
            },

            deletePatient: (id) => {
                set((s) => ({ patients: s.patients.filter((p) => p.id !== id) }));
            },

            addAssessment: (patientId, assessment) => {
                set((s) => ({
                    patients: s.patients.map((p) =>
                        p.id === patientId
                            ? {
                                ...p,
                                assessments: [assessment, ...p.assessments],
                                status: 'completed' as const,
                            }
                            : p
                    ),
                }));
            },

            getPatient: (id) => get().patients.find((p) => p.id === id),
        }),
        { name: 'lupus-patients' }
    )
);
