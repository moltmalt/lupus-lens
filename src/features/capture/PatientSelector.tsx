import { useState } from 'react';
import { usePatientStore } from '@/stores/patientStore';
import { useSessionStore } from '@/stores/appStore';
import { Card, CardContent } from '@/components/ui/card';
import {
    Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { UserPlus, Check } from 'lucide-react';

export function PatientSelector() {
    const patients = usePatientStore((s) => s.patients);
    const addPatient = usePatientStore((s) => s.addPatient);
    const { selectedPatientId, selectPatient } = useSessionStore();
    const [newCode, setNewCode] = useState('');
    const [mode, setMode] = useState<'search' | 'new'>('search');

    const selectedPatient = patients.find((p) => p.id === selectedPatientId);

    const handleSelectExisting = (id: string) => {
        selectPatient(id);
    };

    const handleCreateNew = () => {
        if (!newCode.trim()) return;
        const id = addPatient(newCode.trim());
        selectPatient(id);
        setNewCode('');
        setMode('search');
    };

    return (
        <Card>
            <CardContent className="p-2 space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Patient</Label>
                    {selectedPatient && (
                        <Badge variant="secondary" className="text-xs gap-1">
                            <Check className="h-3 w-3" />
                            {selectedPatient.code}
                        </Badge>
                    )}
                </div>

                {mode === 'search' ? (
                    <>
                        <Command className="rounded-md border">
                            <CommandInput placeholder="Search patient code…" />
                            <CommandList>
                                <CommandEmpty>No patients found.</CommandEmpty>
                                <CommandGroup>
                                    {patients.map((p) => (
                                        <CommandItem
                                            key={p.id}
                                            value={p.code}
                                            onSelect={() => handleSelectExisting(p.id)}
                                            className={selectedPatientId === p.id ? 'bg-accent' : ''}
                                        >
                                            <span className="font-medium">{p.code}</span>
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                {p.assessments.length} scan{p.assessments.length !== 1 ? 's' : ''}
                                            </span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMode('new')}
                            className="w-full"
                        >
                            <UserPlus className="h-4 w-4 mr-1.5" />
                            New Patient
                        </Button>
                    </>
                ) : (
                    <div className="space-y-2">
                        <Input
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                            placeholder="Enter new patient code…"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setMode('search')} className="flex-1">
                                Back
                            </Button>
                            <Button size="sm" onClick={handleCreateNew} disabled={!newCode.trim()} className="flex-1">
                                Create & Select
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
