"use client";

import { useEffect, useRef } from "react";
import MetricCard from "./MetricCard";
import SectionCard from "./SectionCard";

function getChartDefaults() {
    const isDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return {
        gridColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
        tickColor: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)",
        tooltipBg: isDark ? "#1e293b" : "#ffffff",
        tooltipTitle: isDark ? "#e2e8f0" : "#0f172a",
        tooltipBody: isDark ? "#94a3b8" : "#475569",
        tooltipBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    };
}

function aggregateMonthly(labels, values) {
    const monthMap = new Map(); // key: "2026-01", value: { label, total }

    labels.forEach((dateStr, idx) => {
        const date = new Date(dateStr);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });

        const value = values[idx] ?? 0;

        if (!monthMap.has(key)) {
            monthMap.set(key, { label: monthLabel, total: 0 });
        }
        monthMap.get(key).total += value;
    });

    // Urutkan berdasarkan key (chronological), karena Map insertion order biasanya sudah urut
    // tapi tetap aman di-sort ulang
    const sorted = [...monthMap.entries()].sort(([a], [b]) => (a > b ? 1 : -1));

    return {
        labels: sorted.map(([, v]) => v.label),
        values: sorted.map(([, v]) => v.total),
    };
}

const baseScales = (d) => ({
    x: {
        grid: { color: d.gridColor },
        ticks: { color: d.tickColor, font: { size: 11 }, maxTicksLimit: 12 },
    },
    y: {
        grid: { color: d.gridColor },
        ticks: { color: d.tickColor, font: { size: 11 } },
    },
});

const baseTooltip = (d) => ({
    mode: "index",
    intersect: false,
    backgroundColor: d.tooltipBg,
    titleColor: d.tooltipTitle,
    bodyColor: d.tooltipBody,
    borderColor: d.tooltipBorder,
    borderWidth: 1,
    padding: 10,
    cornerRadius: 8,
});

export default function TabXGBoost({ data }) {
    const forecastRef = useRef(null);
    const futureRef = useRef(null);
    const forecastChartRef = useRef(null);
    const futureChartRef = useRef(null);

    const { xgboost, actual } = data;

    const xgbMetrics = {
        mape: { value: xgboost.data.matrix[0].mape.toFixed(2) + "%", label: "MAPE", sub: "Mean Absolute Percentage", color: "orange" },
        rmse: { value: xgboost.data.matrix[0].rmse.toFixed(2), label: "RMSE", sub: "Root Mean Square Error", color: "amber" },
        mae: { value: xgboost.data.matrix[0].mae.toFixed(2), label: "MAE", sub: "Mean Absolute Error", color: "green" },
    };

    const { record: xgboostRecord } = xgboost.data;
    const { data: actualRecord } = actual;

    // ── Chart "Now" vs Aktual ──────────────────────────────────────
    const filteredXgboostNow = xgboostRecord.length > 0 ? xgboostRecord.filter((e) => e.forecast_type === "NOW") : [];
    const xgboostNowMap = new Map(filteredXgboostNow.map((e) => [e.date, e.qty]));
    const nowLabels = filteredXgboostNow.map((e) => e.date).sort((a, b) => new Date(a) - new Date(b));

    const actualMap = new Map(actualRecord.map((e) => [e.date, e.qty]));
    const actualValue = nowLabels.map((date) => actualMap.get(date) ?? null);
    const xgboostNowValue = nowLabels.map((date) => xgboostNowMap.get(date) ?? null);

    // ── Chart "Future" ──────────────────────────────────────────────
    const filteredXgboostFuture = xgboostRecord.length > 0 ? xgboostRecord.filter((e) => e.forecast_type === "FUTURE") : [];
    const futureLabels = filteredXgboostFuture.map((e) => e.date).sort((a, b) => new Date(a) - new Date(b));
    const xgboostFutureMap = new Map(filteredXgboostFuture.map((e) => [e.date, e.qty]));
    const xgboostFutureValue = futureLabels.map((date) => xgboostFutureMap.get(date) ?? null);

    useEffect(() => {
        let charts = [];
        let cancelled = false;

        Promise.all([import("chart.js/auto"), import("chartjs-plugin-zoom")]).then(([{ default: Chart }, { default: zoomPlugin }]) => {
            if (cancelled) return;

            Chart.register(zoomPlugin);

            const d = getChartDefaults();

            const forecastChart = new Chart(forecastRef.current, {
                type: "line",
                data: {
                    labels: nowLabels,
                    datasets: [
                        {
                            label: "Aktual",
                            data: actualValue,
                            spanGaps: true,
                            borderColor: "#2563eb",
                            backgroundColor: "transparent",
                            borderWidth: 2.5,
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            pointBackgroundColor: "#2563eb",
                        },
                        {
                            label: "XGBoost",
                            data: xgboostNowValue,
                            spanGaps: true,
                            borderColor: "#16a34a",
                            backgroundColor: "transparent",
                            borderWidth: 2.5,
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            pointBackgroundColor: "#16a34a",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    plugins: {
                        legend: { display: true, labels: { boxWidth: 12, font: { size: 11 }, color: d.tickColor } },
                        tooltip: baseTooltip(d),
                        zoom: {
                            pan: { enabled: true, mode: "x", modifierKey: null },
                            zoom: {
                                wheel: { enabled: true },
                                pinch: { enabled: true },
                                mode: "x",
                            },
                            limits: { x: { minRange: 10 } },
                        },
                    },
                    scales: baseScales(d),
                },
            });

            const { labels: futureMonthlyLabels, values: futureMonthlyValues } = aggregateMonthly(futureLabels, xgboostFutureValue);

            const futureChart = new Chart(futureRef.current, {
                type: "line",
                data: {
                    labels: futureMonthlyLabels, // ✅ ganti dari futureLabels
                    datasets: [
                        {
                            label: "Prediksi 1 Tahun ke Depan",
                            data: futureMonthlyValues, // ✅ ganti dari xgboostFutureValue
                            spanGaps: true,
                            borderColor: "#16a34a",
                            backgroundColor: "transparent",
                            borderWidth: 2.5,
                            tension: 0.4,
                            pointRadius: 4, // dimunculkan lagi, datanya cuma ~12 titik
                            pointHoverRadius: 6,
                            pointBackgroundColor: "#16a34a",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    plugins: {
                        legend: { display: true, labels: { boxWidth: 12, font: { size: 11 }, color: d.tickColor } },
                        tooltip: baseTooltip(d),
                        zoom: {
                            pan: { enabled: true, mode: "x", modifierKey: null },
                            zoom: {
                                wheel: { enabled: true },
                                pinch: { enabled: true },
                                mode: "x",
                            },
                            limits: { x: { minRange: 6 } }, // disesuaikan, karena cuma ~12 titik total
                        },
                    },
                    scales: baseScales(d),
                },
            });

            charts.push(forecastChart, futureChart);
            forecastChartRef.current = forecastChart;
            futureChartRef.current = futureChart;
        });

        return () => {
            cancelled = true;
            charts.forEach((c) => c.destroy());
        };
    }, [nowLabels, actualValue, xgboostNowValue, futureLabels, xgboostFutureValue]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(xgbMetrics).map((m) => (
                    <MetricCard key={m.label} label={m.label} value={m.value} sub={m.sub} color={m.color} />
                ))}
            </div>

            <SectionCard title="🤖 Grafik Peramalan XGBoost (vs Aktual)" badge="Machine Learning">
                <div className="relative h-72 lg:h-96">
                    <canvas ref={forecastRef} />
                </div>
            </SectionCard>

            <SectionCard title="🔮 Prediksi 1 Tahun ke Depan" badge="Future Forecast">
                <div className="relative h-72 lg:h-96">
                    <canvas ref={futureRef} />
                </div>
            </SectionCard>
        </div>
    );
}
