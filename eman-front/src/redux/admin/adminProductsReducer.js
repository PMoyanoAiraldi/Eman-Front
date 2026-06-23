import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from '../../api/axiosInstance'

export const fetchAllProducts = createAsyncThunk(
    'adminProducts/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
        const res = await axiosInstance.get('/products/all') // ← el interceptor pone el token solo
        return res.data
        } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

export const createProduct = createAsyncThunk(
    'adminProducts/create',
    async (productData, { rejectWithValue }) => {
        try {
        const res = await axiosInstance.post('/products', productData)
        return res.data
        } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

export const updateProduct = createAsyncThunk(
    'adminProducts/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
        const res = await axiosInstance.put(`/products/${id}`, data)
        return res.data
        } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

export const toggleProductState = createAsyncThunk(
    'adminProducts/toggleState',
    async ({ id, state }, { rejectWithValue }) => {
        try {
        const res = await axiosInstance.patch(`/products/${id}/state`, { state })
        return res.data
        } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

export const updateVariantStock = createAsyncThunk(
    'adminProducts/updateVariantStock',
    async ({ id, stock }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.patch(`/product_variants/${id}/stock`, { stock })
            return res.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

const initialState = {
    products: [],
    loading: false,
    error: null
}

const adminProductsSlice = createSlice({
    name: "adminProducts",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchAllProducts.pending, (state) => { state.loading = true; state.error = null })
        .addCase(fetchAllProducts.fulfilled, (state, action) => { state.loading = false; state.products = action.payload }) //guarda todos los productos
        .addCase(fetchAllProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload }) //muestra el error

        .addCase(createProduct.fulfilled, (state, action) => { state.products.unshift(action.payload) })// agrega al inicio de la lista (más reciente primero)

        .addCase(updateProduct.fulfilled, (state, action) => {
            const index = state.products.findIndex(p => p.id === action.payload.id)
            if (index !== -1) state.products[index] = action.payload // reemplaza el producto modificado
        })

        .addCase(toggleProductState.fulfilled, (state, action) => {
            const index = state.products.findIndex(p => p.id === action.payload.id)
            if (index !== -1) state.products[index] = action.payload // actualiza el estado del producto
        })
    }
})

export default adminProductsSlice.reducer