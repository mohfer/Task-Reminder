import axiosInstance from './axiosInstance';

export const dashboardApi = {
    getDashboard: () => axiosInstance.get('/dashboard'),

    getChart: (semester) =>
        axiosInstance.get('/dashboard/chart', { params: { semester } }),

    getSemesterOverview: () =>
        axiosInstance.get('/dashboard/semester-overview'),
};
