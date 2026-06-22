import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from '../../api/axiosInstance'

export const fetchAllUsers = createAsyncThunk(
    'adminUsers/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get('/users')
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

export const toggleUserState = createAsyncThunk(
    'adminUsers/toggleState',
    async ({ id, state }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.patch(`/users/${id}/state`, { state })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

const initialState = {
    users: [],
    loading: false,
    error: null
}

const adminUsersSlice = createSlice({
    name: 'adminUsers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchAllUsers.pending, (state) => { state.loading = true; state.error = null })
        .addCase(fetchAllUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload.data })
        .addCase(fetchAllUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload })

        .addCase(toggleUserState.fulfilled, (state, action) => {
            const index = state.users.findIndex(u => u.id === action.payload.id)
            if (index !== -1) state.users[index] = action.payload
        })
    }
})

export default adminUsersSlice.reducer