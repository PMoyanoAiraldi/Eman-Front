import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance"

// Trae productos por categoría — para CategoryPage
export const fetchProductsByCategory = createAsyncThunk(
    'products/fetchProductsByCategory',
    async (categoryId, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/products?categoryId=${categoryId}`);
            return { categoryId, products: res.data }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error al cargar productos');
        }
    }
);

// Trae productos destacados — para Featured en Home
export const fetchFeaturedProducts = createAsyncThunk(
    'products/fetchFeaturedProducts',
    async (_, { rejectWithValue }) => {
        try {
        const res = await axiosInstance.get('/products/featured')
        return res.data
        } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Error al cargar destacados')
        }
    }
)

// Trae un producto por ID — para ProductDetail
export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
        const res = await axiosInstance.get(`/products/${id}`)
        return res.data
        } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Producto no encontrado')
        }
    }
)

const initialState = {
    products: [],           // productos de la categoría activa
    featuredProducts: [],   // productos destacados del home
    selectedProduct: null,  // producto del detalle
    loading: false,
    error: null
};

export const productsSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        clearSelectedProduct: (state) => {
            state.selectedProduct = null
        },
        clearProducts: (state) => {
            state.products = []
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchProductsByCategory
            .addCase(fetchProductsByCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.products  // reemplaza toda la lista
            })
            .addCase(fetchProductsByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // fetchFeaturedProducts
            .addCase(fetchFeaturedProducts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
                state.loading = false
                state.featuredProducts = action.payload
            })
            .addCase(fetchFeaturedProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // fetchProductById
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false
                state.selectedProduct = action.payload
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
        }

});

export const { clearSelectedProduct, clearProducts } = productsSlice.actions;
    
export default productsSlice.reducer;