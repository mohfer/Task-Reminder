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
    const selectedSemester = useSemesterStore((state) => state.semester);
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

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 16,
                    font: {
                        size: window.innerWidth < 640 ? 11 : 13,
                    },
                },
            },
            title: {
                display: true,
                text: `Data ${selectedSemester}`,
                font: {
                    size: window.innerWidth < 640 ? 13 : 16,
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 0,
                    font: {
                        size: window.innerWidth < 640 ? 10 : 12,
                    },
                    callback: function (value) {
                        const label = this.getLabelForValue(value);
                        if (window.innerWidth < 640 && label.length > 12) {
                            return label.substring(0, 12) + '...';
                        }
                        return label;
                    },
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: {
                        size: window.innerWidth < 640 ? 10 : 12,
                    },
                },
            },
        },
        onClick: (_, elements) => {
            if (elements.length > 0) {
                const clickedElementIndex = elements[0].index;
                const selected = courseContents[clickedElementIndex];
                setSelectedCourse(selected);
            }
        },
    }), [selectedSemester, courseContents]);

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
                <CardContent className="p-3 sm:p-4 sm:px-8">
                    <div className="h-[300px] w-full sm:h-[420px]">
                        <Bar data={data} options={options} />
                    </div>
                </CardContent>
            </Card>

            <ChartTaskTable rows={tableRows} />
        </>
    );
};
