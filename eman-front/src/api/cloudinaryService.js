import axiosInstance from './axiosInstance'

export const cloudinaryService = {
    getUsage: async () => {
        const { data } = await axiosInstance.get('/file-upload/usage')
        return data.percent
    },
}