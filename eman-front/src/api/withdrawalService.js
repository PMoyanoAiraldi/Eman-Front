import axiosInstance from "./axiosInstance";

export const withdrawalService = {
    create: async ({ orderNumber, email, note }) => {
        const { data } = await axiosInstance.post("/order/withdrawal", { orderNumber, email, note });
        return data;
    },
};