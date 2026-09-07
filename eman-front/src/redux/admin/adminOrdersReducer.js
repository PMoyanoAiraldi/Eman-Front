import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from '../../api/axiosInstance'

export const fetchAllOrders = createAsyncThunk(
    'adminOrders/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const params = {}
            if (filters.states?.length) params.state = filters.states.join(',')
            if (filters.shippingTypes?.length) params.shippingType = filters.shippingTypes.join(',')
            if (filters.labelStatuses?.length) params.labelStatus = filters.labelStatuses.join(',')
            if (filters.dateFrom) params.dateFrom = filters.dateFrom
            if (filters.dateTo) params.dateTo = filters.dateTo
            if (filters.search) params.search = filters.search

            const res = await axiosInstance.get('/order', { params })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

export const updateOrderState = createAsyncThunk(
    'adminOrders/updateState',
    async ({ id, state, trackingNumber }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.patch(`/order/${id}/state`, { state, trackingNumber })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

const initialState = {
    orders: [],
    loading: false,
    error: null
}

const adminOrdersSlice = createSlice({
    name: 'adminOrders',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchAllOrders.pending, (state) => { state.loading = true; state.error = null })
        .addCase(fetchAllOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload })
        .addCase(fetchAllOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload })

        .addCase(updateOrderState.fulfilled, (state, action) => {
            const index = state.orders.findIndex(o => o.id === action.payload.id)
            if (index !== -1) state.orders[index] = action.payload
        })
    }
})

export default adminOrdersSlice.reducer