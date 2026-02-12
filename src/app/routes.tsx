import { createBrowserRouter } from 'react-router-dom';
import { ClinicalLayout } from '@/app/layouts/ClinicalLayout';
import { DashboardPage } from '@/pages/Dashboard';
import { CaptureHubPage } from '@/pages/CaptureHub';
import { PatientProfilePage } from '@/pages/PatientProfile';
import { ROUTES } from '@/lib/constants';

export const router = createBrowserRouter([
    {
        element: <ClinicalLayout />,
        children: [
            { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
            { path: ROUTES.CAPTURE, element: <CaptureHubPage /> },
            { path: ROUTES.PATIENT_PROFILE, element: <PatientProfilePage /> },
        ],
    },
]);
