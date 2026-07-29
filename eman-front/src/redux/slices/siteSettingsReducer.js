import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance"

export const fetchMaintenanceStatus = createAsyncThunk(
    'siteSettings/fetchStatus',
    async () => {
        const { data } = await axiosInstance.get('/settings/maintenance');
        return data.maintenanceMode;
    }
);

export const toggleMaintenanceMode = createAsyncThunk(
    'siteSettings/toggle',
    async () => {
        const { data } = await axiosInstance.patch('/settings/maintenance');
        return data.maintenanceMode;
    }
);

const siteSettingsSlice = createSlice({
    name: 'siteSettings',
    initialState: { maintenanceMode: false, loading: true },
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchMaintenanceStatus.fulfilled, (state, action) => {
            state.maintenanceMode = action.payload;
            state.loading = false;
        })
        .addCase(toggleMaintenanceMode.fulfilled, (state, action) => {
            state.maintenanceMode = action.payload;
        });
    },
});

export default siteSettingsSlice.reducer;