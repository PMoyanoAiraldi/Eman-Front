import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  items: [],        // productos en el carrito
  isOpen: false,    // para abrir/cerrar el drawer del carrito
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {

    addItem: (state, action) => {
        const { product, size } = action.payload
        const exists = state.items.find(
            i => i.id === product.id && i.size === size && i.color?.name === product.color?.name
        )
        if (exists) {
            exists.quantity += 1  // si ya está, suma cantidad
        } else {
            state.items.push({ ...product, size, quantity: 1 })
        }
    },

    removeItem: (state, action) => {
        const { id, size } = action.payload
        state.items = state.items.filter(
            i => !(i.id === id && i.size === size && i.color?.name === action.payload.color?.name)
        )
    },

    increaseQuantity: (state, action) => {
        const { id, size } = action.payload
        const item = state.items.find(i => i.id === id && i.size === size && i.color?.name === action.payload.color?.name)
        if (item && item.quantity < item.stock) {  
        item.quantity += 1
    }
    },

    decreaseQuantity: (state, action) => {
        const { id, size } = action.payload
        const item = state.items.find(i => i.id === id && i.size === size && i.color?.name === action.payload.color?.name)
        if (item) {
            if (item.quantity === 1) {
            // si llega a 0 lo elimina directamente
            state.items = state.items.filter(
                i => !(i.id === id && i.size === size)
            )
            } else {
            item.quantity -= 1
            }
        }
    },

    clearCart: (state) => {
        state.items = []
    },

    toggleCart: (state) => {
        state.isOpen = !state.isOpen
    },

    openCart: (state) => {
        state.isOpen = true
    },

    closeCart: (state) => {
        state.isOpen = false
    },

    }

    
})

// Cantidad total de items (para el badge del navbar)
export const selectCartCount = (state) =>
    state.cart.items.reduce((acc, i) => acc + i.quantity, 0)

// Total en pesos
export const selectCartTotal = (state) =>
  state.cart.items.reduce((acc, i) => acc + Number(i.price) * i.quantity, 0)

export const {
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
} = cartSlice.actions

export default cartSlice.reducer