import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { WeeklySchedule } from '@/components/Schedule/WeeklySchedule';
import { useCourseContents } from '@/hooks/useCourseContents';
import useSemesterStore from '@/store/useSemesterStore';
import { Skeleton } from '@/components/ui/skeleton';

const Schedule = () => {
    const selectedSemester = useSemesterStore((state) => state.semester);
    const { courseContents, isLoading } = useCourseContents(selectedSemester);

    useEffect(() => {
        document.title = 'Schedule - Task Reminder';
    }, []);

    return (
        <AppLayout title="Schedule">
            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-[520px] w-full" />
                </div>
            ) : (
                <WeeklySchedule courseContents={courseContents} />
            )}
        </AppLayout>
    );
};

export default Schedule;
