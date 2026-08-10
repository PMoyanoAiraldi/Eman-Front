import axiosInstance from './axiosInstance';

export const authService = {
    login: async (email, password) => {
        const { data } = await axiosInstance.post('/auth/login', { email, password });
        return data; // { user, accessToken }
    },

    register: async (userData) => {
        const { data } = await axiosInstance.post('/auth/register', userData);
        return data;
    },

    logout: async () => {
        await axiosInstance.post('/auth/logout');
    },

    // Se llama al montar la app para recuperar la sesión si hay cookie válida
    refreshToken: async () => {
        const { data } = await axiosInstance.post('/auth/refresh');
        return data; // { accessToken }
    },

    forgotPassword: async (email) => {
    const { data } = await axiosInstance.patch('/users/forgot-password', { email })
    return data
    },

    resetPassword: async (token, newPassword) => {
        const { data } = await axiosInstance.patch('/users/reset-password', { token, newPassword })
        return data
    },
};