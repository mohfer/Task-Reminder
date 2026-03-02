import { useEffect, useState } from 'react';
import { useModal } from '@/hooks/useModal';
import useSemesterStore from '@/store/useSemesterStore';
import { useAssessments } from '@/hooks/useAssessments';
import { AssessmentTable } from '@/components/assessment/AssessmentTable';
import { IpsSummary } from '@/components/assessment/IpsSummary';
import { ScoreUpdateDialog } from '@/components/assessment/ScoreUpdateDialog';

export const AssessmentView = () => {
    const { semester: selectedSemester } = useSemesterStore();
    const { courseContents, totalIps, totalIpk, isLoading, isMutating, updateScore } = useAssessments(selectedSemester);

    const updateDialog = useModal();
    const [selectedContent, setSelectedContent] = useState(null);

    useEffect(() => {
        document.title = 'Assessments - Task Reminder';
    }, []);

    return (
        <div className="space-y-6">
            <AssessmentTable
                rows={courseContents}
                isLoading={isLoading}
                onEdit={(content) => {
                    setSelectedContent(content);
                    updateDialog.open();
                }}
            />

            {!isLoading ? <IpsSummary ips={totalIps} ipk={totalIpk} /> : null}

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
        </div>
    );
};
