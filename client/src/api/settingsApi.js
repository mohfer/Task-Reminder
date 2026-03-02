import axiosInstance from './axiosInstance';

export const settingsApi = {
    getSettings: () => axiosInstance.get('/settings'),

    updateDeadlineNotification: (data) =>
        axiosInstance.put('/settings/deadline-notification', data),

    updateTaskCreatedNotification: (data) =>
        axiosInstance.patch('/settings/task-created-notification', data),

    updateTaskCompletedNotification: (data) =>
        axiosInstance.patch('/settings/task-completed-notification', data),
};
