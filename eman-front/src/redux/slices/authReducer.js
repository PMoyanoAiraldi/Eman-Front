import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    accessToken: null, // solo en memoria, nunca en localStorage
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => { //guarda user + accessToken solo en memoria.
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
            state.error = null;
            // Guardamos datos básicos para persistir entre pestañas
            localStorage.setItem('user', JSON.stringify(action.payload.user))
        },
        setToken: (state, action) => {
            // Solo actualiza el token (lo usa el interceptor en el refresh)
            state.accessToken = action.payload;
        },
        logoutUser: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('user')
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});       

export const { setCredentials, setToken, logoutUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;