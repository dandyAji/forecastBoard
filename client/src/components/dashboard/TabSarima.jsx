"use client";

import { useEffect, useRef } from "react";
import MetricCard from "./MetricCard";
import SectionCard from "./SectionCard";
import ParamGrid from "./ParamGrid";
import { sarimaForecastLabels, actualValues, sarimaPredicted, sarimaForecastOnly, sarimaCI_upper, sarimaCI_lower, sarimaResiduals, acfValues, months, sarimaParams } from "@/lib/dashboardData";

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

const baseScales = (d) => ({
    x: {
        grid: { color: d.gridColor },
        ticks: { color: d.tickColor, font: { size: 11 }, maxTicksLimit: 10 },
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

export default function TabSarima({ data }) {
    const forecastRef = useRef(null);
    const residualRef = useRef(null);
    const forecastChartRef = useRef(null);

    const acfRef = useRef(null);

    // sarima data
    const { matrix: sarimaMatrix, record: sarimaRecord } = data.sarima.data;

    // actual data
    const { data: actualRecord } = data.actual;

    const sarimaMetrics = {
        mape: { value: sarimaMatrix[0].mape.toFixed(2) + "%", label: "MAPE", sub: "Mean Absolute Percentage", color: "blue" },
        rmse: { value: sarimaMatrix[0].rmse.toFixed(2), label: "RMSE", sub: "Root Mean Square Error", color: "pink" },
        mae: { value: sarimaMatrix[0].mae.toFixed(2), label: "MAE", sub: "Mean Absolute Error", color: "purple" },
    };

    // 1. Filter data SARIMA yang forecast_type "NOW"
    const filteredSarimaRecord = sarimaRecord.length > 0 ? sarimaRecord.filter((e) => e.forecast_type === "NOW") : [];

    // 2. Buat Map untuk lookup qty SARIMA berdasarkan tanggal
    const sarimaMap = new Map(filteredSarimaRecord.map((e) => [e.date, e.qty]));

    // 3. Ambil rentang tanggal SARIMA sebagai acuan sumbu X (sudah urut dari backend, tapi sort untuk jaga-jaga)
    const chartLabels = filteredSarimaRecord.map((e) => e.date).sort((a, b) => new Date(a) - new Date(b));

    // 4. Filter actual supaya hanya tanggal yang ada di rentang SARIMA, lalu mapping qty-nya
    const actualMap = new Map(actualRecord.map((e) => [e.date, e.qty]));
    const actualValue = chartLabels.map((date) => actualMap.get(date) ?? null);
    const sarimaValue = chartLabels.map((date) => sarimaMap.get(date) ?? null);

    console.log("data asrima", data);

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
                    labels: chartLabels,
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
                            label: "Sarima",
                            data: sarimaValue,
                            spanGaps: true,
                            borderColor: "#db2777",
                            backgroundColor: "transparent",
                            borderWidth: 2.5,
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            pointBackgroundColor: "#db2777",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                boxWidth: 12,
                                font: { size: 11 },
                                color: d.tickColor,
                                filter: (item) => !item.text.includes("CI"),
                            },
                        },
                        tooltip: baseTooltip(d),
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: "x",
                                modifierKey: null,
                            },
                            zoom: {
                                wheel: { enabled: true },
                                pinch: { enabled: true },
                                mode: "x",
                            },
                            limits: {
                                x: { minRange: 10 },
                            },
                        },
                    },
                    scales: baseScales(d),
                },
            });

            charts.push(forecastChart);
            forecastChartRef.current = forecastChart; // simpan buat tombol reset zoom
        });

        return () => {
            cancelled = true;
            charts.forEach((c) => c.destroy());
        };
    }, [chartLabels, actualValue, sarimaValue]);

    return (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(sarimaMetrics).map((m) => (
                    <MetricCard key={m.label} label={m.label} value={m.value} sub={m.sub} color={m.color} />
                ))}
            </div>

            {/* Forecast chart */}
            <SectionCard
                title="📈 Grafik Peramalan SARIMA"
                badge={
                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                        Live
                    </span>
                }
            >
                <div className="flex flex-wrap gap-4 mb-3">
                    {[
                        { color: "bg-blue-600", label: "Aktual" },
                        { color: "bg-pink-600", label: "Prediksi", dashed: true },
                    ].map((leg) => (
                        <span key={leg.label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className={`inline-block h-0.5 w-5 rounded ${leg.color} ${leg.dashed ? "border-t-2 border-dashed border-pink-600 bg-transparent" : ""} ${leg.wide ? "h-2.5 w-4 rounded" : ""}`} />
                            {leg.label}
                        </span>
                    ))}
                </div>
                <div className="relative h-72 lg:h-96">
                    <div className="flex justify-end mb-2">
                        <button onClick={() => forecastChartRef.current?.resetZoom()} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                            Reset Zoom
                        </button>
                    </div>
                    <canvas ref={forecastRef} />
                </div>
            </SectionCard>
        </div>
    );
}
