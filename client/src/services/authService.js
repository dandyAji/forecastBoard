import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://103.176.78.208:8000";

export const api = axios.create({
    baseURL: API_BASE_URL,
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

// Kalau token expired/invalid, redirect otomatis ke /login
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
        return Promise.reject(error);
    },
);

export async function loginUser({ email, password }) {
    const response = await api.post("/api/v1/auth/login", { email, password });
    const { token, user } = response.data;

    if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
}

export function logoutUser() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
}

export function getCurrentUser() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
}
