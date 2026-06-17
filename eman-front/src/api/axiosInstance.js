import axios from 'axios';
import  store  from '../redux/store/store';
import { setToken, logoutUser } from '../redux/slices/authReducer';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3010',
    withCredentials: true, // para que la cookie refresh_token viaje sola
});

// Adjunta el accessToken en cada request
axiosInstance.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Si recibe 401, intenta renovar el token y reintenta la request original
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Si ya hay un refresh en curso, la request espera en la cola
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // La cookie viaja sola gracias a withCredentials
                const { data } = await axios.post(
                    'http://localhost:3010/auth/refresh',
                    {},
                    { withCredentials: true }
                );

                store.dispatch(setToken(data.accessToken));
                processQueue(null, data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                store.dispatch(logoutUser());
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;