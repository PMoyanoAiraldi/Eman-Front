import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userReducer";           
import productsReducer from "./productsReducer";   
import adminProductsReducer from "../redux/admin/adminProductsReducer"
import cartReducer from "./cartReducer"


const store = configureStore({
    reducer: {
        user: userReducer,         
        products: productsReducer, 
        cart: cartReducer,
        adminProducts:  adminProductsReducer
    }
})

export default store;