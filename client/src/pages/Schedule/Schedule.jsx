import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { WeeklySchedule } from '@/components/Schedule/WeeklySchedule';
import { useCourseContents } from '@/hooks/useCourseContents';
import useSemesterStore from '@/store/useSemesterStore';

const Schedule = () => {
    const selectedSemester = useSemesterStore((state) => state.semester);
    const { courseContents, isLoading } = useCourseContents(selectedSemester);

    useEffect(() => {
        document.title = 'Schedule - Task Reminder';
    }, []);

    return (
        <AppLayout title="Schedule">
            <WeeklySchedule courseContents={courseContents} isLoading={isLoading} />
        </AppLayout>
    );
};

export default Schedule;
