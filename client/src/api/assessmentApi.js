import axiosInstance from './axiosInstance';

export const assessmentApi = {
    calculate: (semester) =>
        axiosInstance.get('/assessments/calculate', { params: { semester } }),

    update: (id, data) => axiosInstance.patch(`/assessments/${id}`, data),

    sync: (taskId, semester) =>
        axiosInstance.post('/assessments/sync', { task_id: taskId, semester }),

    getMonitoringTasks: () =>
        axiosInstance.get('/assessments/monitoring-tasks'),
};
