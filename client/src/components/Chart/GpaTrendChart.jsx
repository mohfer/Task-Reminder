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

const buildCumulativeGpa = (semesters) => {
    const values = [];
    let weightedTotal = 0;
    let creditsTotal = 0;

    semesters.forEach((semester) => {
        if (semester.has_complete_scores && semester.total_credits > 0) {
            weightedTotal += semester.semester_gpa * semester.total_credits;
            creditsTotal += semester.total_credits;
        }
        values.push(creditsTotal > 0 ? Number((weightedTotal / creditsTotal).toFixed(2)) : 0);
    });

    return values;
};

export const GpaTrendChart = ({ semesters }) => {
    const labels = useMemo(() => semesters.map((item) => item.semester), [semesters]);
    const semesterGpaValues = useMemo(() => semesters.map((item) => Number(item.semester_gpa || 0)), [semesters]);
    const cumulativeGpaValues = useMemo(() => buildCumulativeGpa(semesters), [semesters]);

    const data = useMemo(() => ({
        labels,
        datasets: [
            {
                label: 'Semester GPA',
                data: semesterGpaValues,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Cumulative GPA',
                data: cumulativeGpaValues,
                borderColor: 'rgba(22, 163, 74, 1)',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                borderDash: [6, 4],
                tension: 0.35,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    }), [labels, semesterGpaValues, cumulativeGpaValues]);

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
                text: 'GPA Trend',
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
                max: 4,
                ticks: {
                    stepSize: 0.5,
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
