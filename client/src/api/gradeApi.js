import axiosInstance from './axiosInstance';

export const gradeApi = {
    getAll: () => axiosInstance.get('/settings/grades'),

    create: (data) => axiosInstance.post('/settings/grades', data),

    update: (id, data) => axiosInstance.patch(`/settings/grades/${id}`, data),

    delete: (id) => axiosInstance.delete(`/settings/grades/${id}`),
};
