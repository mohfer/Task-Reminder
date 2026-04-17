import { AppLayout } from '@/components/layout/AppLayout';
import { AssessmentView } from '@/components/Assessment/AssessmentView';

const Assessment = () => {
    return (
        <AppLayout title="Assessments">
            <AssessmentView />
        </AppLayout>
    );
};

export default Assessment;
