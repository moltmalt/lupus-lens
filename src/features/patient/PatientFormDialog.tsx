import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePatientStore } from '@/stores/patientStore';
import type { Patient } from '@/types';

interface PatientFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editPatient?: Patient | null;
}

export function PatientFormDialog({ open, onOpenChange, editPatient }: PatientFormDialogProps) {
    const { addPatient, updatePatient } = usePatientStore();
    const [code, setCode] = useState('');
    const [notes, setNotes] = useState('');

    const isEdit = !!editPatient;

    useEffect(() => {
        if (editPatient) {
            setCode(editPatient.code);
            setNotes(editPatient.clinicianNotes);
        } else {
            setCode('');
            setNotes('');
        }
    }, [editPatient, open]);

    const handleSubmit = async () => {
        if (!code.trim()) return;
        if (isEdit && editPatient) {
            await updatePatient(editPatient.id, { code: code.trim(), clinicianNotes: notes.trim() });
        } else {
            await addPatient(code.trim(), notes.trim());
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update patient details.' : 'Register a new anonymous patient.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="patient-code">Patient Code</Label>
                        <Input
                            id="patient-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="e.g. PT0050"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="patient-notes">Clinician Notes</Label>
                        <Textarea
                            id="patient-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional clinical notes…"
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!code.trim()}>
                        {isEdit ? 'Save Changes' : 'Add Patient'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
