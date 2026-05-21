import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010'

const getAuthHeader = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
}) 

export const fetchAllProducts = createAsyncThunk(
    'adminProducts/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
        const token = getState().user.token // agarra el token del store de user automáticamente
        const res = await axios.get(`${API_URL}/products/all`, getAuthHeader(token))
        return res.data
        } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

export const createProduct = createAsyncThunk(
    'adminProducts/create',
    async (productData, { getState, rejectWithValue }) => {
        try {
        const token = getState().user.token
        const res = await axios.post(`${API_URL}/products`, productData, getAuthHeader(token))
        return res.data
        } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

export const updateProduct = createAsyncThunk(
    'adminProducts/update',
    async ({ id, data }, { getState, rejectWithValue }) => {
        try {
        const token = getState().user.token
        const res = await axios.put(`${API_URL}/products/${id}`, data, getAuthHeader(token))
        return res.data
        } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Error')
        }
    }
)

export const toggleProductState = createAsyncThunk(
    'adminProducts/toggleState',
    async ({ id, state }, { getState, rejectWithValue }) => {
        try {
        const token = getState().user.token
        const res = await axios.patch(`${API_URL}/products/${id}/state`, { state }, getAuthHeader(token))
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