import axiosInstance from './axiosInstance';

export const userApi = {
    getAuthenticatedUser: () => axiosInstance.get('/auth/user'),

    updateProfile: (data) => axiosInstance.put('/settings/profile', data),

    changePassword: (data) => axiosInstance.put('/settings/password', data),
};
