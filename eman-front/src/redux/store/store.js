import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authReducer";           
import productsReducer from "../slices/productsReducer";   
import adminProductsReducer from "../admin/adminProductsReducer"
import cartReducer from "../slices/cartReducer"
import subCategoriesReducer from "../slices/subCategoriesReducer"


const store = configureStore({
    reducer: {
        auth: authReducer,         
        products: productsReducer, 
        cart: cartReducer,
        adminProducts:  adminProductsReducer,
        subCategories: subCategoriesReducer,
    }
})

export default store;