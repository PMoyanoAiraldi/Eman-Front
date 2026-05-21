import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    login: false, //Representa el estado de la sesión
    user: null, //Guarda el usuario actual
    token: localStorage.getItem('token') || null, // persiste al recargar
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (state, action) => {
            state.login = true
            state.user = action.payload.user
            state.token = action.payload.token
            localStorage.setItem('token', action.payload.token) //si se recarga la pag el user no pierde la sesion
        },

        logout: (state) => {
            state.login = false
            state.user = null
            state.token = null
            localStorage.removeItem('token')  
    },  
    },
});       

export const { login, logout} = userSlice.actions
export default userSlice.reducer;