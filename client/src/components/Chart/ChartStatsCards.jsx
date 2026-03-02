import { ListChecks, CheckCircle2, Clock } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';

export const ChartStatsCards = ({ totalTask, completedTask, uncompletedTask, selectedSemester, isLoading }) => {
    return (
        <div className="my-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Total Tasks"
                value={totalTask}
                subtitle={`Since ${selectedSemester}`}
                icon={ListChecks}
                iconColor="text-primary"
                isLoading={isLoading}
            />
            <StatCard
                title="Completed Task"
                value={completedTask}
                subtitle={`Since ${selectedSemester}`}
                icon={CheckCircle2}
                iconColor="text-success"
                isLoading={isLoading}
            />
            <StatCard
                title="Uncompleted Task"
                value={uncompletedTask}
                subtitle={`Since ${selectedSemester}`}
                icon={Clock}
                iconColor="text-warning"
                isLoading={isLoading}
            />
        </div>
    );
};
