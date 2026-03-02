import axiosInstance from './axiosInstance';

export const courseContentApi = {
    filter: (semester) => axiosInstance.get('/course-contents/filter', { params: { semester } }),

    create: (data) =>
        axiosInstance.post('/course-contents', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    update: (id, data) => axiosInstance.put(`/course-contents/${id}`, data),

    delete: (id) => axiosInstance.delete(`/course-contents/${id}`),

    downloadTemplate: () =>
        axiosInstance.get('/course-contents/download-template', {
            responseType: 'blob',
        }),

    importFromExcel: (formData, onUploadProgress) =>
        axiosInstance.post('/course-contents/import-from-excel', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress,
        }),
};
