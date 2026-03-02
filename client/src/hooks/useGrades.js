import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { gradeApi } from '@/api/gradeApi';

export const useGrades = () => {
    const [grades, setGrades] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);

    const fetchGrades = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
                setIsLoading(true);
            }
            const response = await gradeApi.getAll();
            setGrades(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
        }
    }, []);

    const createGrade = useCallback(
        async (data) => {
            try {
                setIsMutating(true);
                const response = await gradeApi.create(data);
                toast.success(response.data.message);
                await fetchGrades(false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to create grade.');
                return { success: false, errors: error.response?.data?.errors || {} };
            } finally {
                setIsMutating(false);
            }
        },
        [fetchGrades]
    );

    const updateGrade = useCallback(
        async (id, data) => {
            try {
                setIsMutating(true);
                const response = await gradeApi.update(id, data);
                toast.success(response.data.message);
                await fetchGrades(false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update grade.');
                return { success: false, errors: error.response?.data?.errors || {} };
            } finally {
                setIsMutating(false);
            }
        },
        [fetchGrades]
    );

    const deleteGrade = useCallback(
        async (id) => {
            try {
                setIsMutating(true);
                await gradeApi.delete(id);
                toast.success('Grade deleted successfully.');
                await fetchGrades(false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete grade.');
                return { success: false };
            } finally {
                setIsMutating(false);
            }
        },
        [fetchGrades]
    );

    useEffect(() => {
        fetchGrades();
    }, [fetchGrades]);

    return {
        grades,
        isLoading,
        isMutating,
        createGrade,
        updateGrade,
        deleteGrade,
    };
};
