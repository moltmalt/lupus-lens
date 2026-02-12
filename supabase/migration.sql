-- ====================================================
-- Lupus-Lens Supabase Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ====================================================

-- 1) Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  clinician_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL,
  confidence REAL NOT NULL,
  gene_vector REAL[] DEFAULT '{}',
  gene_contributions JSONB DEFAULT '[]',
  image_url TEXT,
  gradcam_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessments_patient ON assessments(patient_id);

-- 3) Storage bucket for retinal scans + heatmaps
INSERT INTO storage.buckets (id, name, public)
VALUES ('scans', 'scans', true)
ON CONFLICT (id) DO NOTHING;

-- 4) Row Level Security — allow all for anon (public app, no auth)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on patients" ON patients
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on assessments" ON assessments
  FOR ALL USING (true) WITH CHECK (true);

-- Storage policies — allow public read/write to scans bucket
CREATE POLICY "Allow public upload to scans" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'scans');

CREATE POLICY "Allow public read from scans" ON storage.objects
  FOR SELECT USING (bucket_id = 'scans');
