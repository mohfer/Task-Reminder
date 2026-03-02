import axiosInstance from './axiosInstance';

export const taskApi = {
    getAll: () => axiosInstance.get('/tasks'),

    getById: (id) => axiosInstance.get(`/tasks/${id}`),

    create: (data) => axiosInstance.post('/tasks', data),

    update: (id, data) => axiosInstance.put(`/tasks/${id}`, data),

    delete: (id) => axiosInstance.delete(`/tasks/${id}`),

    updateStatus: (id, status) => axiosInstance.patch(`/tasks/${id}/status`, { status }),
};
