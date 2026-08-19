import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authReducer";           
import productsReducer from "../slices/productsReducer";   
import adminProductsReducer from "../admin/adminProductsReducer"
import adminOrdersReducer from "../admin/adminOrdersReducer"
import adminUsersReducer from "../admin/adminUsersReducer"
import cartReducer from "../slices/cartReducer"
import subCategoriesReducer from "../slices/subCategoriesReducer"
import siteSettingsReducer from "../slices/siteSettingsReducer"

//middleware chiquito que persiste después de cada acción del cart
const cartPersistMiddleware = (store) => (next) => (action) => {
    const result = next(action)
    if (action.type.startsWith("cart/")) {
        localStorage.setItem("cart", JSON.stringify(store.getState().cart.items))
    }
    return result
}

const store = configureStore({
    reducer: {
        auth: authReducer,         
        products: productsReducer, 
        cart: cartReducer,
        adminProducts:  adminProductsReducer,
        subCategories: subCategoriesReducer,
        adminOrders: adminOrdersReducer,
        adminUsers: adminUsersReducer,
        siteSettings: siteSettingsReducer
    },
    middleware: (getDefault) => getDefault().concat(cartPersistMiddleware)
})

export default store;