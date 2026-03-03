import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSemesterOverview } from '@/hooks/useSemesterOverview';
import { GpaTrendChart } from '@/components/Chart/GpaTrendChart';
import { TaskDistributionLineChart } from '@/components/Chart/TaskDistributionLineChart';
import { GraduationCap, ListChecks, CheckCircle2, Clock } from 'lucide-react';

export const SemesterOverviewView = () => {
    const { semesters, overviewData, isLoading } = useSemesterOverview();

    if (isLoading) {
        return (
            <Card className="mt-4">
                <CardContent className="space-y-3 p-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-72 w-full" />
                    <Skeleton className="h-72 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!semesters.length) {
        return (
            <Card className="mt-4">
                <CardContent className="p-6 text-sm text-muted-foreground">
                    No semester data available to display.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Cumulative GPA"
                    value={Number(overviewData?.cumulative_gpa ?? 0).toFixed(2)}
                    subtitle="All semesters"
                    icon={GraduationCap}
                    iconColor="text-primary"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Tasks"
                    value={overviewData?.total_task_all ?? 0}
                    subtitle="All semesters"
                    icon={ListChecks}
                    iconColor="text-primary"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Completed Tasks"
                    value={overviewData?.completed_task_all ?? 0}
                    subtitle="All semesters"
                    icon={CheckCircle2}
                    iconColor="text-success"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Uncompleted Tasks"
                    value={overviewData?.uncompleted_task_all ?? 0}
                    subtitle="All semesters"
                    icon={Clock}
                    iconColor="text-warning"
                    isLoading={isLoading}
                />
            </div>

            <GpaTrendChart semesters={semesters} />
            <TaskDistributionLineChart semesters={semesters} />
        </div>
    );
};
