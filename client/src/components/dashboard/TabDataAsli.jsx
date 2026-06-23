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

export default function TabDataAsli({ data }) {
    const trendRef = useRef(null);
    const trendChartRef = useRef(null);

    const rows = Array.isArray(data?.data) ? data.data : [];
    const stats = data?.stats ?? { count: 0, avg: 0, min: 0, max: 0 };
    const value = rows.length > 0 ? rows.map((e) => e.qty) : [];
    const label = rows.length > 0 ? rows.map((e) => e.date) : [];

    useEffect(() => {
        let charts = [];
        let cancelled = false;

        Promise.all([import("chart.js/auto"), import("chartjs-plugin-zoom")]).then(([{ default: Chart }, { default: zoomPlugin }]) => {
            if (cancelled) return;

            Chart.register(zoomPlugin);

            const d = getChartDefaults();

            const trendChart = new Chart(trendRef.current, {
                type: "line",
                data: {
                    labels: label,
                    datasets: [
                        {
                            label: "Konsumsi (kg)",
                            data: value,
                            borderColor: "#2563eb",
                            backgroundColor: "rgba(37,99,235,0.07)",
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            pointHitRadius: 8,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    plugins: {
                        legend: { display: false },
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
                    scales: {
                        x: {
                            grid: { color: d.gridColor },
                            ticks: {
                                color: d.tickColor,
                                font: { size: 11 },
                                maxTicksLimit: 12,
                                autoSkip: true,
                            },
                        },
                        y: {
                            grid: { color: d.gridColor },
                            ticks: { color: d.tickColor, font: { size: 11 } },
                        },
                    },
                },
            });

            charts.push(trendChart);
            trendChartRef.current = trendChart;
        });

        return () => {
            cancelled = true;
            charts.forEach((c) => c.destroy());
        };
    }, [value, label]);

    return (
        <div className="space-y-6">
            {/* Metrics row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Data" value={stats.count.toLocaleString("id-ID")} sub="Jan 2024 – Des 2024" color="blue" />
                <MetricCard label="Rata-rata Harian" value={stats.avg.toLocaleString("id-ID")} sub=" per hari" color="purple" />
                <MetricCard label="Nilai Tertinggi" value={stats.max.toLocaleString("id-ID")} sub="" color="green" />
                <MetricCard label="Nilai Terendah" value={stats.min.toLocaleString("id-ID")} sub="" color="orange" />
            </div>

            {/* Trend chart */}
            <SectionCard title="📈 Tren Data Aktual — Konsumsi Plastik PE Harian" badge="Aktual">
                <div className="flex justify-end mb-2">
                    <button onClick={() => trendChartRef.current?.resetZoom()} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        Reset Zoom
                    </button>
                </div>
                <div className="relative h-72 lg:h-80">
                    <canvas ref={trendRef} />
                </div>
            </SectionCard>

            {/* Raw data table */}
            <SectionCard title="📋 Data Aktual">
                <div className="max-h-96 overflow-y-auto overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="py-2 px-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">#</th>
                                <th className="py-2 px-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Periode</th>
                                <th className="py-2 px-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">Konsumsi</th>
                                <th className="py-2 px-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">Δ Periode Lalu</th>
                                <th className="py-2 px-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Tren</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center text-slate-400 text-sm">
                                        Belum ada data
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row, idx) => {
                                    const prevQty = idx > 0 ? rows[idx - 1].qty : null;
                                    const delta = prevQty !== null ? row.qty - prevQty : null;
                                    const isUp = delta !== null && delta >= 0;

                                    return (
                                        <tr key={row.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="py-2 px-3 text-slate-400 dark:text-slate-500 text-xs">{idx + 1}</td>
                                            <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">{new Date(row.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                                            <td className="py-2 px-3 text-right font-bold text-blue-600 dark:text-blue-400">{row.qty.toLocaleString("id-ID")}</td>
                                            <td className={`py-2 px-3 text-right font-semibold ${delta === null ? "text-slate-400 dark:text-slate-500" : isUp ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>{delta === null ? "-" : `${isUp ? "+" : ""}${delta.toLocaleString("id-ID")}`}</td>
                                            <td className="py-2 px-3 text-center">
                                                {delta === null ? <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">-</span> : <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${isUp ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}>{isUp ? "↑ Naik" : "↓ Turun"}</span>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    );
}
