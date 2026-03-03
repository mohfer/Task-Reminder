import { useCallback, useEffect, useMemo, useState } from 'react';
import { dashboardApi } from '@/api/dashboardApi';

export const useSemesterOverview = () => {
    const [overviewData, setOverviewData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchOverview = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await dashboardApi.getSemesterOverview();
            setOverviewData(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    const semesters = useMemo(() => overviewData?.semesters ?? [], [overviewData]);

    return {
        overviewData,
        semesters,
        isLoading,
        refetch: fetchOverview,
    };
};
