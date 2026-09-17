import { useEffect, useState } from 'react';
import { useModal } from '@/hooks/useModal';
import useSemesterStore from '@/store/useSemesterStore';
import { useAssessments } from '@/hooks/useAssessments';
import { useSettings } from '@/hooks/useSettings';
import { AssessmentTable } from '@/components/Assessment/AssessmentTable';
import { GpaSummary } from '@/components/Assessment/GpaSummary';
import { ScoreUpdateDialog } from '@/components/Assessment/ScoreUpdateDialog';
import { SyncDialog } from '@/components/Assessment/SyncDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AssessmentView = () => {
    const selectedSemester = useSemesterStore((state) => state.semester);
    const { settings } = useSettings();
    const { courseContents, totalSemesterGpa, totalCumulativeGpa, isLoading, isMutating, updateScore, syncScores } = useAssessments(selectedSemester);

    const updateDialog = useModal();
    const syncDialog = useModal();
    const [selectedContent, setSelectedContent] = useState(null);

    useEffect(() => {
        document.title = 'Assessments - Task Reminder';
    }, []);

    // Assessments depend on course contents: with an empty semester there is
    // nothing to score and nothing for Siakang sync to match against.
    if (!isLoading && courseContents.length === 0) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent>
                        <EmptyState
                            icon={GraduationCap}
                            title="No assessments yet"
                            description="Add courses first to start tracking grades."
                            actionLabel="Add Courses"
                            actionTo="/course-contents"
                        />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {settings?.has_siakang_credentials ? (
                <div className="flex gap-4">
                    <Button variant="outline" onClick={syncDialog.open}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Sync from Siakang
                    </Button>
                </div>
            ) : null}

            <AssessmentTable
                rows={courseContents}
                isLoading={isLoading}
                onEdit={(content) => {
                    setSelectedContent(content);
                    updateDialog.open();
                }}
            />

            {!isLoading && courseContents.length > 0 ? <GpaSummary semesterGpa={totalSemesterGpa} cumulativeGpa={totalCumulativeGpa} /> : null}

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
                isLoading={isMutating}
                onSubmit={syncScores}
                targetSemester={selectedSemester}
                hasCredentials={Boolean(settings?.has_siakang_credentials)}
            />
        </div>
    );
};
