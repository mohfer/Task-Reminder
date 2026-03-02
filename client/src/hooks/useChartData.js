import { useState, useCallback, useEffect } from 'react';
import { dashboardApi } from '@/api/dashboardApi';

export const useChartData = (selectedSemester) => {
    const [courseContents, setCourseContents] = useState([]);
    const [completedTask, setCompletedTask] = useState(0);
    const [uncompletedTask, setUncompletedTask] = useState(0);
    const [totalTask, setTotalTask] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchChartData = useCallback(async (semester) => {
        try {
            setIsLoading(true);
            const response = await dashboardApi.getChart(semester);
            setCourseContents(response.data.data.course_contents);
            setCompletedTask(response.data.data.completed_task);
            setUncompletedTask(response.data.data.uncompleted_task);
            setTotalTask(response.data.data.total_task);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChartData(selectedSemester);
    }, [selectedSemester, fetchChartData]);

    return {
        courseContents,
        completedTask,
        uncompletedTask,
        totalTask,
        isLoading,
    };
};
