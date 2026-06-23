// services/forecastService.js
import api from "@/lib/axios";

export async function getForecastList({ page = 1, limit = 5 } = {}) {
    const { data } = await api.get("/forecast", {
        params: { page, limit },
    });
    return data;
}

export async function createForecast({ title, description, file }) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description ?? "");
    formData.append("file", file);

    const { data } = await api.post("/forecast", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}

export async function getActualData(id) {
    const { data } = await api.get(`/forecast/actual/${id}`);
    return data;
}

export async function getSarimaData(id) {
    const { data } = await api.get(`/forecast/sarima/${id}`);
    return data;
}

export async function getXGBoostData(id) {
    const { data } = await api.get(`/forecast/xgboost/${id}`);
    return data;
}

export async function getForecastDetail(id) {
    const { data } = await api.get(`/forecast/${id}`);
    return data;
}
