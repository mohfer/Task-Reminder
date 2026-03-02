import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskStatsCards } from '@/components/dashboard/TaskStatsCards';
import { TaskMonthCalendar } from '@/components/dashboard/TaskMonthCalendar';
import { TaskDateTable } from '@/components/dashboard/TaskDateTable';
import { TaskFormDialog } from '@/components/dashboard/TaskFormDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { BarChartView } from '@/components/chart/BarChartView';
import { useDashboard } from '@/hooks/useDashboard';
import { useModal } from '@/hooks/useModal';

export const DashboardView = () => {
    const {
        dashboardData,
        isLoading,
        isMutating,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        fetchCourseContentsBySemester,
    } = useDashboard();

    const createModal = useModal();
    const editModal = useModal();
    const deleteModal = useModal();

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const [editingTask, setEditingTask] = useState(null);
    const [deleteTaskId, setDeleteTaskId] = useState(null);
    const [courseContents, setCourseContents] = useState([]);

    const tasks = useMemo(() => dashboardData?.tasks || [], [dashboardData]);

    const { completed, uncompleted } = useMemo(() => {
        const result = { completed: [], uncompleted: [] };
        for (const task of tasks) {
            const taskDate = new Date(task.deadline);
            if (taskDate.getMonth() !== selectedMonth || taskDate.getFullYear() !== selectedYear) {
                continue;
            }
            if (task.status === 1) {
                result.completed.push(task);
            } else {
                result.uncompleted.push(task);
            }
        }
        return result;
    }, [tasks, selectedMonth, selectedYear]);

    const tasksForDate = useMemo(() => {
        if (!selectedDate) {
            return [];
        }
        const dateText = selectedDate.toLocaleDateString();
        return tasks.filter((task) => new Date(task.deadline).toLocaleDateString() === dateText);
    }, [tasks, selectedDate]);

    const handleOpenEdit = async (task) => {
        setEditingTask(task);
        if (task.semester) {
            const contents = await fetchCourseContentsBySemester(task.semester);
            setCourseContents(contents);
        }
        editModal.open();
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="tasks">
                <TabsList>
                    <TabsTrigger value="tasks">Task Lists</TabsTrigger>
                    <TabsTrigger value="chart">Bar Chart</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks">
                    <div className="mt-4 flex justify-end lg:justify-start">
                        <Button onClick={createModal.open}>
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Button>
                    </div>

                    <TaskStatsCards
                        totalTasks={completed.length + uncompleted.length}
                        completedCount={completed.length}
                        uncompletedCount={uncompleted.length}
                        isLoading={isLoading}
                    />

                    <TaskMonthCalendar
                        tasks={tasks}
                        selectedDate={selectedDate}
                        onDateSelect={(date) => {
                            setSelectedDate(date);
                            setSelectedMonth(date.getMonth());
                            setSelectedYear(date.getFullYear());
                        }}
                        onMonthChange={(month, year) => {
                            setSelectedMonth(month);
                            setSelectedYear(year);
                        }}
                    />

                    {selectedDate ? (
                        <TaskDateTable
                            tasks={tasksForDate}
                            onStatusChange={updateTaskStatus}
                            onEdit={handleOpenEdit}
                            onDelete={(id) => {
                                setDeleteTaskId(id);
                                deleteModal.open();
                            }}
                            isMutating={isMutating}
                        />
                    ) : null}
                </TabsContent>

                <TabsContent value="chart">
                    <BarChartView />
                </TabsContent>
            </Tabs>

            <TaskFormDialog
                open={createModal.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        createModal.open();
                    } else {
                        createModal.close();
                    }
                }}
                mode="create"
                initialData={null}
                courseContents={courseContents}
                onSemesterChange={async (semester) => {
                    const contents = await fetchCourseContentsBySemester(semester);
                    setCourseContents(contents);
                }}
                onSubmit={(payload) => createTask(payload)}
                isLoading={isMutating}
            />

            <TaskFormDialog
                open={editModal.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        editModal.open();
                    } else {
                        editModal.close();
                    }
                }}
                mode="edit"
                initialData={editingTask}
                courseContents={courseContents}
                onSemesterChange={async (semester) => {
                    const contents = await fetchCourseContentsBySemester(semester);
                    setCourseContents(contents);
                }}
                onSubmit={(payload, taskId) => updateTask(taskId, payload)}
                isLoading={isMutating}
            />

            <DeleteConfirmDialog
                open={deleteModal.isOpen}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        deleteModal.open();
                    } else {
                        deleteModal.close();
                    }
                }}
                title="Delete Task"
                description="Once data is deleted, it cannot be restored."
                onConfirm={async () => {
                    await deleteTask(deleteTaskId);
                    deleteModal.close();
                }}
                isLoading={isMutating}
            />
        </div>
    );
};
