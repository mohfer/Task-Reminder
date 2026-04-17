import { useEffect, useState } from 'react';
import { Plus, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/useModal';
import useSemesterStore from '@/store/useSemesterStore';
import { useCourseContents } from '@/hooks/useCourseContents';
import { CourseContentTable } from '@/components/CourseContent/CourseContentTable';
import { CreditsSummary } from '@/components/CourseContent/CreditsSummary';
import { CourseContentFormDialog } from '@/components/CourseContent/CourseContentFormDialog';
import { ExcelImportDialog } from '@/components/CourseContent/ExcelImportDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

export const CourseContentView = () => {
    const selectedSemester = useSemesterStore((state) => state.semester);
    const {
        courseContents,
        totalCredits,
        isLoading,
        isMutating,
        createCourseContent,
        updateCourseContent,
        deleteCourseContent,
        downloadTemplate,
        importFromExcel,
    } = useCourseContents(selectedSemester);

    const createDialog = useModal();
    const editDialog = useModal();
    const deleteDialog = useModal();
    const excelDialog = useModal();

    const [editingContent, setEditingContent] = useState(null);
    const [deleteContentId, setDeleteContentId] = useState(null);

    useEffect(() => {
        document.title = 'Course Contents - Task Reminder';
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <Button onClick={createDialog.open}>
                    <Plus className="mr-2 h-4 w-4" /> New Course Content
                </Button>

                <Button onClick={excelDialog.open}>
                    <Import className="mr-2 h-4 w-4" /> Excel
                </Button>
            </div>

            <CourseContentTable
                rows={courseContents}
                isLoading={isLoading}
                onEdit={(content) => {
                    setEditingContent(content);
                    editDialog.open();
                }}
                onDelete={(contentId) => {
                    setDeleteContentId(contentId);
                    deleteDialog.open();
                }}
            />

            {!isLoading ? <CreditsSummary totalCredits={totalCredits} /> : null}

            <CourseContentFormDialog
                open={createDialog.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        createDialog.open();
                    } else {
                        createDialog.close();
                    }
                }}
                mode="create"
                initialData={null}
                isLoading={isMutating}
                onSubmit={(payload) => createCourseContent(payload)}
            />

            <CourseContentFormDialog
                open={editDialog.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        editDialog.open();
                    } else {
                        editDialog.close();
                    }
                }}
                mode="edit"
                initialData={editingContent}
                isLoading={isMutating}
                onSubmit={(payload, contentId) => updateCourseContent(contentId, payload)}
            />

            <DeleteConfirmDialog
                open={deleteDialog.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        deleteDialog.open();
                    } else {
                        deleteDialog.close();
                    }
                }}
                title="Delete Course Content"
                description="Once data is deleted, it cannot be restored. Deleting this data may also remove related data such as tasks."
                isLoading={isMutating}
                onConfirm={async () => {
                    await deleteCourseContent(deleteContentId);
                    deleteDialog.close();
                }}
            />

            <ExcelImportDialog
                open={excelDialog.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        excelDialog.open();
                    } else {
                        excelDialog.close();
                    }
                }}
                isLoading={isMutating}
                onDownloadTemplate={downloadTemplate}
                onImport={importFromExcel}
            />
        </div>
    );
};
