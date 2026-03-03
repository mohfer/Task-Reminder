import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Card, CardContent } from '@/components/ui/card';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const TaskDistributionLineChart = ({ semesters }) => {
    const labels = useMemo(() => semesters.map((item) => item.semester), [semesters]);

    const data = useMemo(() => ({
        labels,
        datasets: [
            {
                label: 'Total Tasks',
                data: semesters.map((item) => item.total_task),
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Completed Tasks',
                data: semesters.map((item) => item.completed_task),
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                tension: 0.35,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Uncompleted Tasks',
                data: semesters.map((item) => item.uncompleted_task),
                borderColor: 'rgba(234, 179, 8, 1)',
                backgroundColor: 'rgba(234, 179, 8, 0.12)',
                tension: 0.35,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    }), [labels, semesters]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 16,
                    font: { size: window.innerWidth < 640 ? 11 : 13 },
                },
            },
            title: {
                display: true,
                text: 'Task Distribution per Semester',
                font: { size: window.innerWidth < 640 ? 13 : 16 },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: { size: window.innerWidth < 640 ? 10 : 12 },
                },
            },
            x: {
                ticks: {
                    font: { size: window.innerWidth < 640 ? 10 : 12 },
                },
            },
        },
    }), []);

    return (
        <Card>
            <CardContent className="p-3 sm:p-4 sm:px-8">
                <div className="h-[300px] w-full sm:h-[380px]">
                    <Line data={data} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};
