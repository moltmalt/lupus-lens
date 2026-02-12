import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Patient, PatientStoreState, Assessment } from '@/types';
import * as db from '@/lib/db';

export const usePatientStore = create<PatientStoreState>()(
    devtools(
        (set, get) => ({
            patients: [],
            loading: false,

            // ── Fetch all from Supabase ──────────────────────
            fetchPatients: async () => {
                set({ loading: true });
                try {
                    const patients = await db.fetchPatients();
                    set({ patients, loading: false });
                } catch (err) {
                    console.error('Failed to fetch patients:', err);
                    set({ loading: false });
                }
            },

            // ── Create ──────────────────────────────────────
            addPatient: async (code: string, notes?: string) => {
                try {
                    const patient = await db.createPatient(code, notes);
                    set({ patients: [patient, ...get().patients] });
                    return patient.id;
                } catch (err) {
                    console.error('Failed to add patient:', err);
                    return '';
                }
            },

            // ── Update ──────────────────────────────────────
            updatePatient: async (
                id: string,
                data: Partial<Pick<Patient, 'code' | 'status' | 'clinicianNotes'>>
            ) => {
                try {
                    const dbData: Record<string, string> = {};
                    if (data.code !== undefined) dbData.code = data.code;
                    if (data.status !== undefined) dbData.status = data.status;
                    if (data.clinicianNotes !== undefined) dbData.clinician_notes = data.clinicianNotes;

                    await db.updatePatient(id, dbData);
                    set({
                        patients: get().patients.map((p) =>
                            p.id === id ? { ...p, ...data } : p
                        ),
                    });
                } catch (err) {
                    console.error('Failed to update patient:', err);
                }
            },

            // ── Delete ──────────────────────────────────────
            deletePatient: async (id: string) => {
                try {
                    await db.deletePatient(id);
                    set({ patients: get().patients.filter((p) => p.id !== id) });
                } catch (err) {
                    console.error('Failed to delete patient:', err);
                }
            },

            // ── Add assessment ──────────────────────────────
            addAssessment: async (patientId: string, assessment: Omit<Assessment, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => {
                try {
                    const created = await db.createAssessment(patientId, {
                        riskScore: assessment.riskScore,
                        confidence: assessment.confidence,
                        geneVector: assessment.geneVector,
                        geneContributions: assessment.geneContributions,
                        imageUrl: assessment.imageUrl,
                        gradCamUrl: assessment.gradCamUrl,
                    });

                    set({
                        patients: get().patients.map((p) =>
                            p.id === patientId
                                ? { ...p, status: 'completed' as const, assessments: [created, ...p.assessments] }
                                : p
                        ),
                    });
                } catch (err) {
                    console.error('Failed to add assessment:', err);
                }
            },

            // ── Get single patient ──────────────────────────
            getPatient: (id: string) => get().patients.find((p) => p.id === id),
        }),
        { name: 'lupus-patients' }
    )
);
