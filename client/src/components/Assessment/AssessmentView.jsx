import { useEffect, useState } from 'react';
import { useModal } from '@/hooks/useModal';
import useSemesterStore from '@/store/useSemesterStore';
import { useAssessments } from '@/hooks/useAssessments';
import { AssessmentTable } from '@/components/Assessment/AssessmentTable';
import { IpsSummary } from '@/components/Assessment/IpsSummary';
import { ScoreUpdateDialog } from '@/components/Assessment/ScoreUpdateDialog';

export const AssessmentView = () => {
    const selectedSemester = useSemesterStore((state) => state.semester);
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
