# Lupus-Lens

A clinical decision-support interface for **SLE (Systemic Lupus Erythematosus)** screening, combining retinal imaging with gene expression analysis via a Swin-SNN fusion model.

**Live Demo →** [lupus-lens-two.vercel.app](https://lupus-lens-two.vercel.app/)

---

## Features

- **Dashboard** — Overview of all registered patients with risk-level badges, scan counts, and status tracking.
- **Capture Hub** — Dual-input capture page — retinal fundus image (via camera or upload) + 20-gene expression vector. Runs Swin-SNN inference.
- **Microarray Converter** — Two-way converter between 20-gene Log2FC vectors and synthetic 4×5 microarray heatmap images.
- **Patient Profile** — Per-patient view with assessment history, gene bar charts, risk timeline, and clinician notes.
- **Cloud Persistence** — Patient records and assessments stored in Supabase (Postgres); retinal scans in Supabase Storage.

## Tech Stack

- **Frontend** — React 19 · TypeScript · Vite · Tailwind CSS v4
- **UI Components** — Radix UI primitives · shadcn/ui · Lucide icons · Recharts
- **State** — Zustand · TanStack React Query
- **Backend** — Supabase (Postgres + Storage)
- **Inference** — Gradio client (`@gradio/client`) connecting to a hosted Swin-SNN model
- **Deployment** — Vercel

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) project with tables: `patients`, `assessments`, and a `scans` storage bucket

### Setup

```bash
# Clone
git clone https://github.com/moltmalt/lupus-lens.git
cd lupus-lens

# Install dependencies
npm install

# Environment variables
cp .env.example .env
# Fill in:
#   VITE_SUPABASE_URL=<your-supabase-url>
#   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Run dev server
npm run dev
```

### Build

```bash
npm run build    # type-check + production build
npm run preview  # preview the production build locally
```

## Project Structure

```
src/
├── app/            # App shell, router, layout
├── components/     # Shared UI primitives (shadcn/ui)
├── features/       # Feature modules
│   ├── capture/    # RetinaViewport, VectorInput
│   ├── inference/  # Swin-SNN Gradio client
│   ├── patient/    # PatientTable, PatientSelector
│   ├── report/     # GeneBarChart, RiskTimeline, MicroarrayConverter
│   └── transcriptomics/  # Gene expression utilities
├── hooks/          # Custom React hooks
├── lib/            # Utilities, validators, constants, Supabase client
├── pages/          # Route-level page components
├── stores/         # Zustand stores (appStore, patientStore)
└── types/          # TypeScript type definitions
```

