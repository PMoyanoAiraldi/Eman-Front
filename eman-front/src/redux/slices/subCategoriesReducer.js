import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../api/axiosInstance"


export const fetchSubCategories = createAsyncThunk(
    'subCategories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
        const res = await axiosInstance.get('/sub_categories')
        return res.data
        } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Error al cargar subcategorías')
        }
    }
)

const initialState = {
    subCategories: [],
    loading: false,
    error: null
}

const subCategoriesSlice = createSlice({
    name: "subCategories",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchSubCategories.pending, (state) => { state.loading = true; state.error = null })
        .addCase(fetchSubCategories.fulfilled, (state, action) => { state.loading = false; state.subCategories = action.payload })
        .addCase(fetchSubCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload })
    }
})

export default subCategoriesSlice.reducer