import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { assessmentApi } from '@/api/assessmentApi';

export const useAssessments = (selectedSemester) => {
    const [courseContents, setCourseContents] = useState([]);
    const [totalIps, setTotalIps] = useState(0);
    const [totalIpk, setTotalIpk] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);

    const fetchAssessments = useCallback(async (semester, showLoading = true) => {
        try {
            if (showLoading) {
                setIsLoading(true);
            }
            const response = await assessmentApi.calculate(semester);
            setCourseContents(response.data.data.course_contents);
            setTotalIps(response.data.data.ips);
            setTotalIpk(response.data.data.ipk);
        } catch (error) {
            console.error(error);
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
        }
    }, []);

    const updateScore = useCallback(
        async (id, score) => {
            try {
                setIsMutating(true);
                const response = await assessmentApi.update(id, { score });
                toast.success(response.data.message);
                await fetchAssessments(selectedSemester, false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update score.');
                return { success: false, errors: error.response?.data?.errors || {} };
            } finally {
                setIsMutating(false);
            }
        },
        [selectedSemester, fetchAssessments]
    );

    useEffect(() => {
        fetchAssessments(selectedSemester);
    }, [selectedSemester, fetchAssessments]);

    return {
        courseContents,
        totalIps,
        totalIpk,
        isLoading,
        isMutating,
        updateScore,
    };
};
