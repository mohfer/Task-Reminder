import axiosInstance from './axiosInstance';

export const authApi = {
    login: (data) => axiosInstance.post('/auth/login', data),

    register: (data) =>
        axiosInstance.post('/auth/register', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    logout: () => axiosInstance.post('/auth/logout'),

    checkToken: () => axiosInstance.get('/auth/check/token'),

    checkEmail: () => axiosInstance.get('/auth/check/email'),

    resendVerificationEmail: (data) => axiosInstance.post('/email/resend', data),

    verifyEmail: (id, hash, params) =>
        axiosInstance.get(`/email/verify/${id}/${hash}`, { params }),
};
