import { AppLayout } from '@/components/layout/AppLayout';
import { CourseContentView } from '@/components/CourseContent/CourseContentView';

const CourseContent = () => {
    return (
        <AppLayout title="Course Content">
            <CourseContentView />
        </AppLayout>
    );
};

export default CourseContent;
