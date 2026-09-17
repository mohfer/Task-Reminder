import { useEffect, useState } from 'react';
import { Plus, BookOpen, Import, RefreshCw, Trash2, Ellipsis } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useModal } from '@/hooks/useModal';
import useSemesterStore from '@/store/useSemesterStore';
import { useCourseContents } from '@/hooks/useCourseContents';
import { useSettings } from '@/hooks/useSettings';
import { CourseContentTable } from '@/components/CourseContent/CourseContentTable';
import { CreditsSummary } from '@/components/CourseContent/CreditsSummary';
import { CourseContentFormDialog } from '@/components/CourseContent/CourseContentFormDialog';
import { ExcelImportDialog } from '@/components/CourseContent/ExcelImportDialog';
import { SyncScheduleDialog } from '@/components/CourseContent/SyncScheduleDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

export const CourseContentView = () => {
    const selectedSemester = useSemesterStore((state) => state.semester);
    const { settings } = useSettings();
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
        syncSchedule,
        clearSemester,
    } = useCourseContents(selectedSemester);

    const createDialog = useModal();
    const editDialog = useModal();
    const deleteDialog = useModal();
    const excelDialog = useModal();
    const syncDialog = useModal();
    const clearDialog = useModal();

    // Siakang sync replaces the whole semester, so it is only available while
    // the semester is empty. Clearing is the explicit path to sync again.
    const canSync = !isLoading && courseContents.length === 0;
    // An empty table (and a "Total Credits: 0" pill) add nothing on mobile,
    // so an empty semester shows only the action buttons above plus a CTA card.
    const isEmpty = !isLoading && courseContents.length === 0;

    const [editingContent, setEditingContent] = useState(null);
    const [deleteContentId, setDeleteContentId] = useState(null);

    useEffect(() => {
        document.title = 'Course Contents - Task Reminder';
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2 sm:gap-4">
                <Button className="flex-1 sm:flex-none" onClick={createDialog.open}>
                    <Plus className="mr-2 h-4 w-4" /> New Course Content
                </Button>

                {settings?.has_siakang_credentials ? (
                    <Button
                        className="flex-1 sm:flex-none"
                        variant="outline"
                        onClick={syncDialog.open}
                        disabled={!canSync}
                        title={
                            canSync
                                ? 'Sync schedule from Siakang'
                                : 'Sync is only available for an empty semester. Clear this semester to sync again.'
                        }
                    >
                        <RefreshCw className="mr-2 h-4 w-4" /> Sync from Siakang
                    </Button>
                ) : null}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="More actions">
                            <Ellipsis className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={excelDialog.open}>
                            <Import /> Excel
                        </DropdownMenuItem>
                        {courseContents.length > 0 && !isLoading ? (
                            <DropdownMenuItem
                                onClick={clearDialog.open}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 /> Clear Semester
                            </DropdownMenuItem>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {isEmpty ? (
                <Card>
                    <CardContent>
                        <EmptyState
                            icon={BookOpen}
                            title="No courses yet"
                            description="Add your first course above or sync from Siakang."
                        />
                    </CardContent>
                </Card>
            ) : (
                <>
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
                </>
            )}

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

            <SyncScheduleDialog
                open={syncDialog.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        syncDialog.open();
                    } else {
                        syncDialog.close();
                    }
                }}
                isLoading={isMutating}
                onSubmit={syncSchedule}
                targetSemester={selectedSemester}
                hasCredentials={Boolean(settings?.has_siakang_credentials)}
            />

            <DeleteConfirmDialog
                open={clearDialog.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        clearDialog.open();
                    } else {
                        clearDialog.close();
                    }
                }}
                title={`Clear ${selectedSemester}`}
                description={`${selectedSemester} contains ${courseContents.length} course(s). Clearing will also remove related tasks and scores. Once data is deleted, it cannot be restored.`}
                isLoading={isMutating}
                onConfirm={async () => {
                    const result = await clearSemester();
                    if (result.success) {
                        clearDialog.close();
                    }
                }}
            />
        </div>
    );
};
