import { useEffect, useState } from 'react';
import { useModal } from '@/hooks/useModal';
import useSemesterStore from '@/store/useSemesterStore';
import { useAssessments } from '@/hooks/useAssessments';
import { useSettings } from '@/hooks/useSettings';
import { AssessmentTable } from '@/components/Assessment/AssessmentTable';
import { GpaSummary } from '@/components/Assessment/GpaSummary';
import { ScoreUpdateDialog } from '@/components/Assessment/ScoreUpdateDialog';
import { SyncDialog } from '@/components/Assessment/SyncDialog';
import { Button } from '@/components/ui/button';

export const AssessmentView = () => {
    const selectedSemester = useSemesterStore((state) => state.semester);
    const { courseContents, totalSemesterGpa, totalCumulativeGpa, isLoading, isMutating, updateScore, syncScores } = useAssessments(selectedSemester);
    const { settings } = useSettings();

    const updateDialog = useModal();
    const syncDialog = useModal();
    const [selectedContent, setSelectedContent] = useState(null);

    useEffect(() => {
        document.title = 'Assessments - Task Reminder';
    }, []);

    const monitoringUrl = settings?.monitoring_url || '';

    return (
        <div className="space-y-6">
            <AssessmentTable
                rows={courseContents}
                isLoading={isLoading}
                onEdit={(content) => {
                    setSelectedContent(content);
                    updateDialog.open();
                }}
                syncButton={
                    <Button variant="outline" size="sm" onClick={syncDialog.open}>
                        Sync from Monitoring
                    </Button>
                }
            />

            {!isLoading ? <GpaSummary semesterGpa={totalSemesterGpa} cumulativeGpa={totalCumulativeGpa} /> : null}

            <ScoreUpdateDialog
                open={updateDialog.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        updateDialog.open();
                    } else {
                        updateDialog.close();
                    }
                }}
                initialData={selectedContent}
                isLoading={isMutating}
                onSubmit={updateScore}
            />

            <SyncDialog
                open={syncDialog.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        syncDialog.open();
                    } else {
                        syncDialog.close();
                    }
                }}
                monitoringUrl={monitoringUrl}
                isLoading={isMutating}
                onSubmit={syncScores}
            />
        </div>
    );
};
