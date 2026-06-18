import axiosInstance from './axiosInstance';

export const userService = {
    updateProfile: async (data) => {
        const { data: response } = await axiosInstance.patch('/users/profile', data);
        return response;
    },

    changePassword: async (oldPassword, newPassword) => {
        const { data } = await axiosInstance.patch('/users/change-password', {
            oldPassword,
            newPassword,
        });
        return data;
    },
};