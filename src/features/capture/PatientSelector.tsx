import { useState, useEffect } from 'react';
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
import { cn } from '@/lib/utils';
import { UserPlus, Check } from 'lucide-react';

export function PatientSelector() {
    const patients = usePatientStore((s) => s.patients);
    const addPatient = usePatientStore((s) => s.addPatient);
    const fetchPatients = usePatientStore((s) => s.fetchPatients);
    const { selectedPatientId, selectPatient } = useSessionStore();
    const [newCode, setNewCode] = useState('');
    const [mode, setMode] = useState<'search' | 'new'>('search');

    useEffect(() => { fetchPatients(); }, [fetchPatients]);

    const selectedPatient = patients.find((p) => p.id === selectedPatientId);

    const handleSelectExisting = (id: string) => {
        // Toggle selection: if already selected, deselect; otherwise select
        if (selectedPatientId === id) {
            selectPatient(null);
        } else {
            selectPatient(id);
        }
    };

    const handleCreateNew = async () => {
        if (!newCode.trim()) return;
        const id = await addPatient(newCode.trim());
        selectPatient(id);
        setNewCode('');
        setMode('search');
    };

    return (
        <Card>
            <CardContent className="p-2 space-y-2">
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Patient</Label>
                    {selectedPatient && (
                        <>
                            <span className="text-muted-foreground">—</span>
                            <Badge 
                                variant="secondary" 
                                className="text-xs gap-1 rounded-full px-3 py-0.5 bg-emerald-600 text-white"
                            >
                                <Check className="h-3 w-3" />
                                {selectedPatient.code}
                            </Badge>
                        </>
                    )}
                </div>

                {mode === 'search' ? (
                    <>
                        <Command className="rounded-md border bg-[#B7A9FD]/20">
                            <CommandInput placeholder="Search patient code…" />
                            <CommandList>
                                <CommandEmpty>No patients found.</CommandEmpty>
                                <CommandGroup>
                                    {patients.map((p) => (
                                        <CommandItem
                                            key={p.id}
                                            value={p.code}
                                            onSelect={() => handleSelectExisting(p.id)}
                                            className={selectedPatientId === p.id ? 'hover:bg-[#6243FC]' : ''}
                                            style={selectedPatientId === p.id ? { backgroundColor: '#6243FC', color: 'white' } : undefined}
                                        >
                                            <span className="font-medium">{p.code}</span>
                                            <span className={cn(
                                                "ml-auto text-xs",
                                                selectedPatientId === p.id ? "text-white/80" : "text-muted-foreground"
                                            )}>
                                                {p.assessments.length} scan{p.assessments.length !== 1 ? 's' : ''}
                                            </span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                        <Button
                            size="sm"
                            onClick={() => setMode('new')}
                            className="w-full hover:opacity-90"
                            style={{ backgroundColor: '#6243FC', color: 'white' }}
                        >
                            <UserPlus className="h-4 w-4 mr-1.5" style={{ color: 'white' }} />
                            New Patient
                        </Button>
                    </>
                ) : (
                    <div className="space-y-2 [&_*::selection]:bg-[#6243FC] [&_*::selection]:text-white">
                        <Input
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                            placeholder="Enter new patient code…"
                            autoFocus
                            className="focus-visible:ring-1 focus-visible:ring-[#6243FC]"
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setMode('search')} className="flex-1">
                                Back
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={handleCreateNew} 
                                disabled={!newCode.trim()} 
                                className="flex-1 hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: '#6243FC', color: 'white' }}
                            >
                                Create & Select
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
