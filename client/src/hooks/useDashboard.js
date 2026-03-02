import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { dashboardApi } from '@/api/dashboardApi';
import { taskApi } from '@/api/taskApi';
import { courseContentApi } from '@/api/courseContentApi';

export const useDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);

    const fetchDashboard = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
                setIsLoading(true);
            }
            const response = await dashboardApi.getDashboard();
            setDashboardData(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
        }
    }, []);

    const updateTaskStatus = useCallback(
        async (taskId, status) => {
            try {
                setIsMutating(true);
                const response = await taskApi.updateStatus(taskId, status ? 1 : 0);
                toast.success(response.data.message);
                await fetchDashboard(false);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update status.');
            } finally {
                setIsMutating(false);
            }
        },
        [fetchDashboard]
    );

    const createTask = useCallback(
        async (data) => {
            try {
                setIsMutating(true);
                const response = await taskApi.create(data);
                toast.success(response.data.message);
                await fetchDashboard(false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to create task.');
                return { success: false, errors: error.response?.data?.errors || {} };
            } finally {
                setIsMutating(false);
            }
        },
        [fetchDashboard]
    );

    const updateTask = useCallback(
        async (id, data) => {
            try {
                setIsMutating(true);
                const response = await taskApi.update(id, data);
                toast.success(response.data.message);
                await fetchDashboard(false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update task.');
                return { success: false, errors: error.response?.data?.errors || {} };
            } finally {
                setIsMutating(false);
            }
        },
        [fetchDashboard]
    );

    const deleteTask = useCallback(
        async (id) => {
            try {
                setIsMutating(true);
                const response = await taskApi.delete(id);
                toast.success(response.data.message);
                await fetchDashboard(false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete task.');
                return { success: false };
            } finally {
                setIsMutating(false);
            }
        },
        [fetchDashboard]
    );

    const fetchCourseContentsBySemester = useCallback(async (semester) => {
        try {
            const response = await courseContentApi.filter(semester);
            return response.data.data.course_contents;
        } catch (error) {
            console.error(error);
            return [];
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return {
        dashboardData,
        isLoading,
        isMutating,
        fetchDashboard,
        updateTaskStatus,
        createTask,
        updateTask,
        deleteTask,
        fetchCourseContentsBySemester,
    };
};
