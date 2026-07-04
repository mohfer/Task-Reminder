import axiosInstance from './axiosInstance';

export const assessmentApi = {
    calculate: (semester) =>
        axiosInstance.get('/assessments/calculate', { params: { semester } }),

    update: (id, data) => axiosInstance.patch(`/assessments/${id}`, data),

    sync: (data, semester) => axiosInstance.post('/assessments/sync', { ...data, semester }),
};
