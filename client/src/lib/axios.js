// lib/axios.js
import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://103.176.78.208:8000/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Pasang token otomatis di setiap request kalau ada di localStorage
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
        return Promise.reject(error);
    },
);

export default api;
