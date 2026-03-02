import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { courseContentApi } from '@/api/courseContentApi';

export const useCourseContents = (selectedSemester) => {
    const [courseContents, setCourseContents] = useState([]);
    const [totalScu, setTotalScu] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);

    const fetchCourseContents = useCallback(async (semester, showLoading = true) => {
        try {
            if (showLoading) {
                setIsLoading(true);
            }
            const response = await courseContentApi.filter(semester);
            setCourseContents(response.data.data.course_contents);
            setTotalScu(response.data.data.total_scu);
        } catch (error) {
            console.error(error);
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
        }
    }, []);

    const createCourseContent = useCallback(
        async (formData) => {
            try {
                setIsMutating(true);
                const response = await courseContentApi.create(formData);
                toast.success(response.data.message);
                await fetchCourseContents(selectedSemester, false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to create course content.');
                return { success: false, errors: error.response?.data?.errors || {} };
            } finally {
                setIsMutating(false);
            }
        },
        [selectedSemester, fetchCourseContents]
    );

    const updateCourseContent = useCallback(
        async (id, data) => {
            try {
                setIsMutating(true);
                const response = await courseContentApi.update(id, data);
                toast.success(response.data.message);
                await fetchCourseContents(selectedSemester, false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update course content.');
                return { success: false, errors: error.response?.data?.errors || {} };
            } finally {
                setIsMutating(false);
            }
        },
        [selectedSemester, fetchCourseContents]
    );

    const deleteCourseContent = useCallback(
        async (id) => {
            try {
                setIsMutating(true);
                await courseContentApi.delete(id);
                toast.success('Course content deleted successfully.');
                await fetchCourseContents(selectedSemester, false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete course content.');
                return { success: false };
            } finally {
                setIsMutating(false);
            }
        },
        [selectedSemester, fetchCourseContents]
    );

    const downloadTemplate = useCallback(async () => {
        try {
            const response = await courseContentApi.downloadTemplate();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'course_contents_template.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Template downloaded successfully.');
        } catch {
            toast.error('Failed to download template.');
        }
    }, []);

    const importFromExcel = useCallback(
        async (file, onProgress) => {
            try {
                setIsMutating(true);
                const formData = new FormData();
                formData.append('file', file);
                const response = await courseContentApi.importFromExcel(formData, onProgress);
                toast.success(response.data.message || 'Import successful.');
                await fetchCourseContents(selectedSemester, false);
                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to import file.');
                return { success: false };
            } finally {
                setIsMutating(false);
            }
        },
        [selectedSemester, fetchCourseContents]
    );

    useEffect(() => {
        fetchCourseContents(selectedSemester);
    }, [selectedSemester, fetchCourseContents]);

    return {
        courseContents,
        totalScu,
        isLoading,
        isMutating,
        createCourseContent,
        updateCourseContent,
        deleteCourseContent,
        downloadTemplate,
        importFromExcel,
    };
};
