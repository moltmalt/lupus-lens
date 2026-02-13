import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientStore } from '@/stores/patientStore';
import { RiskScore } from '@/features/report/RiskScore';
import { GradCamView } from '@/features/report/GradCamView';
import { GeneBarChart } from '@/features/report/GeneBarChart';
import { MicroarrayConverter } from '@/features/report/MicroarrayConverter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { RISK_THRESHOLDS } from '@/lib/constants';
import {
    ArrowLeft, CalendarPlus, UserCheck,
    Clock, ChevronRight, Download, Loader2,
} from 'lucide-react';


function formatDate(ts: string) {
    return new Date(ts).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function getRiskLabel(score: number) {
    if (score >= RISK_THRESHOLDS.HIGH) return 'High Risk';
    if (score >= RISK_THRESHOLDS.MODERATE) return 'Moderate Risk';
    return 'Low Risk';
}

function getRiskColor(score: number) {
    if (score >= RISK_THRESHOLDS.HIGH) return 'bg-red-600 hover:bg-red-700';
    if (score >= RISK_THRESHOLDS.MODERATE) return 'bg-amber-600 hover:bg-amber-700';
    return 'bg-emerald-600 hover:bg-emerald-700';
}

export function PatientProfilePage() {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const patient = usePatientStore((s) => s.patients.find((p) => p.id === patientId));
    const updatePatient = usePatientStore((s) => s.updatePatient);
    const fetchPatients = usePatientStore((s) => s.fetchPatients);
    const loading = usePatientStore((s) => s.loading);
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!patient) {
            fetchPatients();
        }
    }, [patientId, fetchPatients, patient]);

    useEffect(() => {
        if (patient) {
            setNotes(patient.clinicianNotes);
        }
    }, [patient]);

    if (loading && !patient) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground space-y-3">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#6243FC' }} />
                <p className="text-sm">Loading patient profile...</p>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground space-y-3">
                <p className="text-sm">Patient not found.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                    <ArrowLeft className="h-4 w-4 mr-1.5" style={{ color: '#6243FC' }} /> Back to Dashboard
                </Button>
            </div>
        );
    }

    const latest = patient.assessments[0] ?? null;
    const viewedAssessment =
        patient.assessments.find((a) => a.id === selectedAssessmentId) ?? latest;

    const handleSaveNotes = () => {
        updatePatient(patient.id, { clinicianNotes: notes });
    };

    return (
        <div className="p-2 space-y-2 max-w-6xl mx-auto [&_*::selection]:bg-[#6243FC] [&_*::selection]:text-white">
            {/* ── Header ──────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-wrap">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('/')}>
                    <ArrowLeft className="h-4 w-4" style={{ color: '#6243FC' }} />
                </Button>
                <h1 className="text-lg font-semibold">{patient.code}</h1>
                {latest && (
                    <Badge className={cn('text-xs', getRiskColor(latest.riskScore))}>
                        {latest.riskScore}% — {getRiskLabel(latest.riskScore)}
                    </Badge>
                )}
                {latest && (
                    <Badge variant="outline" className="text-xs ml-auto border-[#6243FC]">
                        Confidence: {(latest.confidence * 100).toFixed(0)}%
                    </Badge>
                )}
            </div>

            {/* ── Tabs ────────────────────────────────────── */}
            <Tabs defaultValue="report">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="report" className="data-[state=active]:bg-[#6243FC] data-[state=active]:text-white">Current Report</TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-[#6243FC] data-[state=active]:text-white">Past Reports</TabsTrigger>
                    <TabsTrigger value="notes" className="data-[state=active]:bg-[#6243FC] data-[state=active]:text-white">Notes</TabsTrigger>
                </TabsList>

                {/* ── Current Report ────────────────────────── */}
                <TabsContent value="report" className="space-y-2">
                    {viewedAssessment ? (
                        <>
                            {/* Risk score */}
                            <RiskScore value={viewedAssessment.riskScore} />

                            {/* Microarray Converter Tool */}
                            <MicroarrayConverter />

                            {/* GradCAM + Gene chart side by side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <GradCamView
                                    originalImageUrl={viewedAssessment.imageUrl ?? '/placeholder-retina.png'}
                                    heatmapUrl={viewedAssessment.gradCamUrl ?? '/placeholder-retina.png'}
                                />
                                {viewedAssessment.geneContributions.length > 0 ? (
                                    <GeneBarChart data={viewedAssessment.geneContributions} />
                                ) : (
                                    <Card>
                                        <CardContent className="flex items-center justify-center h-full text-muted-foreground text-sm p-6">
                                            No gene contribution data for this assessment.
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Assessment metadata */}
                            <Card className="bg-[#B7A9FD]/20">
                                <CardContent className="p-2">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Date</p>
                                            <p className="font-medium">{formatDate(viewedAssessment.timestamp)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Risk Score</p>
                                            <p className="font-medium">{viewedAssessment.riskScore}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Confidence</p>
                                            <p className="font-medium">{(viewedAssessment.confidence * 100).toFixed(0)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Genes</p>
                                            <p className="font-medium">{viewedAssessment.geneVector.length}/20</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                                <p className="text-sm">No assessments yet.</p>
                                <Button variant="outline" size="sm" onClick={() => navigate('/capture')}>
                                    Start Assessment
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* ── History ───────────────────────────────── */}
                <TabsContent value="history" className="space-y-1">
                    {patient.assessments.length === 0 ? (
                        <Card>
                            <CardContent className="text-center text-muted-foreground py-8 text-sm">
                                No past assessments.
                            </CardContent>
                        </Card>
                    ) : (
                        patient.assessments.map((a) => (
                            <Card
                                key={a.id}
                                className={cn(
                                    'cursor-pointer transition-colors hover:bg-muted/50 bg-[#B7A9FD]/20',
                                    selectedAssessmentId === a.id && 'ring-1 ring-primary'
                                )}
                                onClick={() => {
                                    setSelectedAssessmentId(a.id);
                                    // switch to report tab
                                    const reportTab = document.querySelector('[data-value="report"]') as HTMLButtonElement | null;
                                    reportTab?.click();
                                }}
                            >
                                <CardContent className="flex items-center p-2 gap-3">
                                    <Clock className="h-4 w-4 shrink-0" style={{ color: '#6243FC' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{formatDate(a.timestamp)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Risk: {a.riskScore}% · Confidence: {(a.confidence * 100).toFixed(0)}%
                                        </p>
                                    </div>
                                    <Badge className={cn('text-xs shrink-0', getRiskColor(a.riskScore))}>
                                        {a.riskScore}%
                                    </Badge>
                                    <ChevronRight className="h-4 w-4 shrink-0" style={{ color: '#6243FC' }} />
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* ── Notes ─────────────────────────────────── */}
                <TabsContent value="notes" className="space-y-2 [&_*::selection]:bg-[#6243FC] [&_*::selection]:text-white">
                    <Card>
                        <CardHeader className="py-1.5 px-2">
                            <CardTitle className="text-sm">Clinician Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add clinical observations, referral notes, follow-up plans…"
                                rows={6}
                                className="focus-visible:ring-2 focus-visible:ring-[#6243FC] focus-visible:border-[#6243FC]"
                            />
                            <Button 
                                size="sm" 
                                onClick={handleSaveNotes}
                                style={{ backgroundColor: '#6243FC' }}
                                className="hover:opacity-90"
                            >
                                Save Notes
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* ── Floating Actions ────────────────────────── */}
            <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
                <Button 
                    size="sm" 
                    variant="secondary" 
                    className="shadow-lg hover:opacity-90"
                    style={{ backgroundColor: '#6243FC', color: 'white' }}
                >
                    <Download className="h-4 w-4 mr-1.5" style={{ color: 'white' }} /> Save PDF
                </Button>
                <Button 
                    size="sm" 
                    variant="secondary" 
                    className="shadow-lg hover:opacity-90"
                    style={{ backgroundColor: '#B7A9FD', color: '#6243FC' }}
                >
                    <UserCheck className="h-4 w-4 mr-1.5" style={{ color: '#6243FC' }} /> Referral
                </Button>
                <Button 
                    size="sm" 
                    variant="secondary" 
                    className="shadow-lg hover:opacity-90"
                    style={{ backgroundColor: '#B7A9FD', color: '#6243FC' }}
                >
                    <CalendarPlus className="h-4 w-4 mr-1.5" style={{ color: '#6243FC' }} /> Follow-up
                </Button>
            </div>
        </div>
    );
}
