import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGrades } from '@/hooks/useGrades';
import { useModal } from '@/hooks/useModal';
import { GradeTable } from '@/components/Grade/GradeTable';
import { GradeFormDialog } from '@/components/Grade/GradeFormDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

export const GradeView = () => {
    const { grades, isLoading, isMutating, createGrade, updateGrade, deleteGrade } = useGrades();
    const createDialog = useModal();
    const editDialog = useModal();
    const deleteDialog = useModal();

    const [editingGrade, setEditingGrade] = useState(null);
    const [deleteGradeId, setDeleteGradeId] = useState(null);

    return (
        <>
            <div className="mt-4 flex justify-end lg:justify-start">
                <Button onClick={createDialog.open}>
                    <Plus className="mr-2 h-4 w-4" /> New Grade
                </Button>
            </div>

            <GradeTable
                rows={grades}
                isLoading={isLoading}
                onEdit={(grade) => {
                    setEditingGrade(grade);
                    editDialog.open();
                }}
                onDelete={(gradeId) => {
                    setDeleteGradeId(gradeId);
                    deleteDialog.open();
                }}
            />

            <GradeFormDialog
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
                onSubmit={(payload) => createGrade(payload)}
            />

            <GradeFormDialog
                open={editDialog.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        editDialog.open();
                    } else {
                        editDialog.close();
                    }
                }}
                mode="edit"
                initialData={editingGrade}
                isLoading={isMutating}
                onSubmit={(payload, gradeId) => updateGrade(gradeId, payload)}
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
                title="Delete Grade"
                description="Once data is deleted, it cannot be restored. Proceed with caution."
                isLoading={isMutating}
                onConfirm={async () => {
                    await deleteGrade(deleteGradeId);
                    deleteDialog.close();
                }}
            />
        </>
    );
};
