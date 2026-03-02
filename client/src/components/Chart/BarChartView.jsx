import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import useSemesterStore from '@/store/useSemesterStore';
import { useChartData } from '@/hooks/useChartData';
import { ChartStatsCards } from '@/components/Chart/ChartStatsCards';
import { ChartTaskTable } from '@/components/Chart/ChartTaskTable';
import { Card, CardContent } from '@/components/ui/card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const flattenTasks = (courseContents) => {
    const rows = [];
    courseContents.forEach((content) => {
        content.tasks.forEach((task) => {
            rows.push({ ...task, course_content: content.course_content });
        });
    });
    return rows;
};

export const BarChartView = () => {
    const { semester: selectedSemester } = useSemesterStore();
    const { courseContents, completedTask, uncompletedTask, totalTask, isLoading } = useChartData(selectedSemester);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const data = useMemo(
        () => ({
            labels: courseContents.map((content) => content.course_content),
            datasets: [
                {
                    label: 'Total Tasks',
                    backgroundColor: 'rgba(59, 130, 246, 1)',
                    hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                    data: courseContents.map((content) => content.total_task),
                },
                {
                    label: 'Completed Tasks',
                    backgroundColor: 'rgba(16, 185, 129, 1)',
                    hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
                    data: courseContents.map((content) => content.completed_task),
                },
                {
                    label: 'Uncompleted Tasks',
                    backgroundColor: 'rgba(234, 179, 8, 1)',
                    hoverBackgroundColor: 'rgba(234, 179, 8, 1)',
                    data: courseContents.map((content) => content.uncompleted_task),
                },
            ],
        }),
        [courseContents]
    );

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: `Data ${selectedSemester}`,
            },
        },
        onClick: (_, elements) => {
            if (elements.length > 0) {
                const clickedElementIndex = elements[0].index;
                const selected = courseContents[clickedElementIndex];
                setSelectedCourse(selected);
            }
        },
    };

    const tableRows = selectedCourse
        ? selectedCourse.tasks.map((task) => ({ ...task, course_content: selectedCourse.course_content }))
        : flattenTasks(courseContents);

    return (
        <>
            <ChartStatsCards
                totalTask={totalTask}
                completedTask={completedTask}
                uncompletedTask={uncompletedTask}
                selectedSemester={selectedSemester}
                isLoading={isLoading}
            />

            <Card className="my-4">
                <CardContent className="p-4 px-8">
                    <div className="h-[420px] w-full min-w-[320px] overflow-x-auto">
                        <Bar data={data} options={options} />
                    </div>
                </CardContent>
            </Card>

            <ChartTaskTable rows={tableRows} />
        </>
    );
};
