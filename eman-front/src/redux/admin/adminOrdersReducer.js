import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from '../../api/axiosInstance'

export const fetchAllOrders = createAsyncThunk(
    'adminOrders/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get('/order')
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

export const updateOrderState = createAsyncThunk(
    'adminOrders/updateState',
    async ({ id, state }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.patch(`/order/${id}/state`, { state })
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