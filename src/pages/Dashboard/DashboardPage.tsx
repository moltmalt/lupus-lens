import { useState, useEffect } from 'react';
import { PatientTable } from '@/features/patient/PatientTable';
import { PatientFormDialog } from '@/features/patient/PatientFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users } from 'lucide-react';
import { usePatientStore } from '@/stores/patientStore';
import type { Patient } from '@/types';

export function DashboardPage() {
    const fetchPatients = usePatientStore((s) => s.fetchPatients);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editPatient, setEditPatient] = useState<Patient | null>(null);

    useEffect(() => { fetchPatients(); }, [fetchPatients]);

    const handleEdit = (patient: Patient) => {
        setEditPatient(patient);
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setEditPatient(null);
        setDialogOpen(true);
    };

    return (
        <div className="p-2 space-y-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-1.5 text-base">
                        <Users className="h-4 w-4" style={{ color: '#6243FC' }} />
                        Patient Registry
                    </CardTitle>
                    <Button 
                        size="sm" 
                        onClick={handleAdd}
                        style={{ backgroundColor: '#6243FC' }}
                        className="hover:opacity-90"
                    >
                        <UserPlus className="h-4 w-4 mr-1.5" />
                        Add Patient
                    </Button>
                </CardHeader>
                <CardContent>
                    <PatientTable onEdit={handleEdit} />
                </CardContent>
            </Card>

            <PatientFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editPatient={editPatient}
            />
        </div>
    );
}
