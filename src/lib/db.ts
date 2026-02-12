import { supabase } from './supabase';
import type { Patient, Assessment, GeneContribution } from '@/types';

// ── Row shapes from Supabase ────────────────────────
interface PatientRow {
    id: string;
    code: string;
    status: string;
    clinician_notes: string;
    created_at: string;
}

interface AssessmentRow {
    id: string;
    patient_id: string;
    risk_score: number;
    confidence: number;
    gene_vector: number[];
    gene_contributions: GeneContribution[];
    image_url: string | null;
    gradcam_url: string | null;
    created_at: string;
}

// ── Mappers ─────────────────────────────────────────
function toPatient(row: PatientRow, assessments: Assessment[] = []): Patient {
    return {
        id: row.id,
        code: row.code,
        status: row.status as Patient['status'],
        clinicianNotes: row.clinician_notes,
        createdAt: row.created_at,
        assessments,
    };
}

function toAssessment(row: AssessmentRow): Assessment {
    return {
        id: row.id,
        timestamp: row.created_at,
        riskScore: row.risk_score,
        confidence: row.confidence,
        imageUrl: row.image_url,
        gradCamUrl: row.gradcam_url,
        geneVector: row.gene_vector ?? [],
        geneContributions: row.gene_contributions ?? [],
    };
}

// ── Patient CRUD ────────────────────────────────────

export async function fetchPatients(): Promise<Patient[]> {
    const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch all assessments in one query
    const { data: assessments, error: aErr } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

    if (aErr) throw aErr;

    // Group assessments by patient_id
    const assessmentMap = new Map<string, Assessment[]>();
    for (const row of (assessments ?? []) as AssessmentRow[]) {
        const list = assessmentMap.get(row.patient_id) ?? [];
        list.push(toAssessment(row));
        assessmentMap.set(row.patient_id, list);
    }

    return (patients as PatientRow[]).map((p) =>
        toPatient(p, assessmentMap.get(p.id) ?? [])
    );
}

export async function createPatient(
    code: string,
    notes = ''
): Promise<Patient> {
    const { data, error } = await supabase
        .from('patients')
        .insert({ code, clinician_notes: notes })
        .select()
        .single();

    if (error) throw error;
    return toPatient(data as PatientRow);
}

export async function updatePatient(
    id: string,
    updates: { code?: string; status?: string; clinician_notes?: string }
): Promise<void> {
    const { error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id);

    if (error) throw error;
}

export async function deletePatient(id: string): Promise<void> {
    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ── Assessment CRUD ─────────────────────────────────

export async function createAssessment(
    patientId: string,
    assessment: {
        riskScore: number;
        confidence: number;
        geneVector: number[];
        geneContributions: GeneContribution[];
        imageUrl: string | null;
        gradCamUrl: string | null;
    }
): Promise<Assessment> {
    const { data, error } = await supabase
        .from('assessments')
        .insert({
            patient_id: patientId,
            risk_score: assessment.riskScore,
            confidence: assessment.confidence,
            gene_vector: assessment.geneVector,
            gene_contributions: assessment.geneContributions,
            image_url: assessment.imageUrl,
            gradcam_url: assessment.gradCamUrl,
        })
        .select()
        .single();

    if (error) throw error;
    return toAssessment(data as AssessmentRow);
}

export async function fetchPatientWithAssessments(
    patientId: string
): Promise<Patient | null> {
    const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

    if (error) return null;

    const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    return toPatient(
        patient as PatientRow,
        ((assessments ?? []) as AssessmentRow[]).map(toAssessment)
    );
}
