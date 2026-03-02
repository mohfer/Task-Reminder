import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardView } from '@/components/Dashboard/DashboardView';

const Dashboard = () => {
    useEffect(() => {
        document.title = 'Dashboard - Task Reminder';
    }, []);

    return (
        <AppLayout title="Dashboard">
            <DashboardView />
        </AppLayout>
    );
};

export default Dashboard;
