import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientStore } from '@/stores/patientStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog, AlertDialogTrigger, AlertDialogContent,
    AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
    AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { RISK_THRESHOLDS } from '@/lib/constants';
import {
    MoreHorizontal, Pencil, Trash2, Search, StickyNote,
} from 'lucide-react';
import type { Patient } from '@/types';

function getRiskLevel(patient: Patient) {
    const latest = patient.assessments[0];
    if (!latest) return null;
    if (latest.riskScore >= RISK_THRESHOLDS.HIGH) return 'high' as const;
    if (latest.riskScore >= RISK_THRESHOLDS.MODERATE) return 'moderate' as const;
    return 'low' as const;
}

function RiskBadge({ level }: { level: 'high' | 'moderate' | 'low' | null }) {
    if (!level) return <span className="text-muted-foreground text-xs">—</span>;
    return (
        <Badge
            className={cn(
                'text-xs capitalize',
                level === 'high' && 'bg-red-600 hover:bg-red-700',
                level === 'moderate' && 'bg-amber-600 hover:bg-amber-700',
                level === 'low' && 'bg-emerald-600 hover:bg-emerald-700',
            )}
        >
            {level}
        </Badge>
    );
}

interface PatientTableProps {
    onEdit: (patient: Patient) => void;
}

export function PatientTable({ onEdit }: PatientTableProps) {
    const navigate = useNavigate();
    const { patients, deletePatient } = usePatientStore();
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

    const filtered = patients.filter((p) =>
        p.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-2">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Patient Code…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Patient Code</TableHead>
                            <TableHead className="hidden sm:table-cell">Last Scan</TableHead>
                            <TableHead>Risk</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead className="hidden md:table-cell text-center"># Scans</TableHead>
                            <TableHead className="hidden lg:table-cell">Notes</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                    {search ? 'No patients match your search.' : 'No patients yet.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((patient) => {
                                const latest = patient.assessments[0];
                                const risk = getRiskLevel(patient);
                                const date = latest
                                    ? new Date(latest.timestamp).toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                    })
                                    : '—';

                                return (
                                    <TableRow
                                        key={patient.id}
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/patients/${patient.id}`)}
                                    >
                                        <TableCell className="font-medium">{patient.code}</TableCell>
                                        <TableCell className="hidden sm:table-cell text-muted-foreground">{date}</TableCell>
                                        <TableCell><RiskBadge level={risk} /></TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant={patient.status === 'completed' ? 'secondary' : 'outline'} className="text-xs capitalize">
                                                {patient.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-center">{patient.assessments.length}</TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {patient.clinicianNotes ? (
                                                <StickyNote className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(patient);
                                                        }}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteTarget(patient);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete confirmation dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete patient {deleteTarget?.code}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this patient and all their assessments. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteTarget) deletePatient(deleteTarget.id);
                                setDeleteTarget(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
