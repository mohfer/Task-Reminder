import axiosInstance from './axiosInstance';

export const settingsApi = {
    getSettings: () => axiosInstance.get('/settings'),

    updateDeadlineNotification: (data) =>
        axiosInstance.put('/settings/deadline-notification', data),

    updateNotificationChannel: (data) =>
        axiosInstance.put('/settings/notification-channel', data),

    updateTelegramChatId: (data) =>
        axiosInstance.put('/settings/telegram-chat-id', data),

    testNotification: () =>
        axiosInstance.post('/settings/test-notification'),

    updateTaskCreatedNotification: (data) =>
        axiosInstance.patch('/settings/task-created-notification', data),

    updateTaskCompletedNotification: (data) =>
        axiosInstance.patch('/settings/task-completed-notification', data),
};
