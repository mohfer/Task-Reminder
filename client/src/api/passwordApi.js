import axiosInstance from './axiosInstance';

export const passwordApi = {
    sendResetLink: (data) => axiosInstance.post('/password/email', data),

    resetPassword: (data) =>
        axiosInstance.post('/password/reset', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};
