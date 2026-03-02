import { memo } from 'react';
import { ListChecks, CheckCircle2, Clock } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';

export const TaskStatsCards = memo(({ totalTasks, completedCount, uncompletedCount, isLoading }) => {
    return (
        <div className="my-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Total Tasks"
                value={totalTasks}
                subtitle="Since this month"
                icon={ListChecks}
                iconColor="text-primary"
                isLoading={isLoading}
            />
            <StatCard
                title="Completed Task"
                value={completedCount}
                subtitle="Since this month"
                icon={CheckCircle2}
                iconColor="text-success"
                isLoading={isLoading}
            />
            <StatCard
                title="Uncompleted Task"
                value={uncompletedCount}
                subtitle="Since this month"
                icon={Clock}
                iconColor="text-warning"
                isLoading={isLoading}
            />
        </div>
    );
});

TaskStatsCards.displayName = 'TaskStatsCards';
