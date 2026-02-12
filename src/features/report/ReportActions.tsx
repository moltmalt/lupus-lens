import { Button } from '@/components/ui/button';
import { Save, FileText, CalendarPlus } from 'lucide-react';

export function ReportActions() {
    return (
        <div className="fixed bottom-0 inset-x-0 p-2 bg-background/80 backdrop-blur-md border-t z-40">
            <div className="flex justify-center gap-2 max-w-md mx-auto">
                <Button size="default" className="flex-1">
                    <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                </Button>
                <Button size="default" variant="outline" className="flex-1">
                    <FileText className="h-3.5 w-3.5 mr-1.5" /> Refer
                </Button>
                <Button size="default" variant="secondary" className="flex-1">
                    <CalendarPlus className="h-3.5 w-3.5 mr-1.5" /> Schedule
                </Button>
            </div>
        </div>
    );
}
