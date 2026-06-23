"use client";

import { useEffect, useRef } from "react";
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

export default function TabHasil({ data }) {
    const overlayRef = useRef(null);

    const { actual, sarima, xgboost } = data;

    const sarimaMatrix = sarima.data.matrix[0];
    const xgboostMatrix = xgboost.data.matrix[0];

    // ── Overlay chart: Aktual vs SARIMA vs XGBoost (forecast_type NOW) ──
    const sarimaNow = sarima.data.record.filter((e) => e.forecast_type === "NOW");
    const xgboostNow = xgboost.data.record.filter((e) => e.forecast_type === "NOW");
    const actualRecord = actual.data;

    const sarimaMap = new Map(sarimaNow.map((e) => [e.date, e.qty]));
    const xgboostMap = new Map(xgboostNow.map((e) => [e.date, e.qty]));
    const actualMap = new Map(actualRecord.map((e) => [e.date, e.qty]));

    const chartLabels = sarimaNow.map((e) => e.date).sort((a, b) => new Date(a) - new Date(b));
    const actualValue = chartLabels.map((date) => actualMap.get(date) ?? null);
    const sarimaValue = chartLabels.map((date) => sarimaMap.get(date) ?? null);
    const xgbValue = chartLabels.map((date) => xgboostMap.get(date) ?? null);

    // ── Kesimpulan otomatis dari metrics asli (tanpa R²) ──
    const mapeDiff = Math.abs(sarimaMatrix.mape - xgboostMatrix.mape);
    const rmseDiff = Math.abs(sarimaMatrix.rmse - xgboostMatrix.rmse);
    const maeDiff = Math.abs(sarimaMatrix.mae - xgboostMatrix.mae);

    const xgbWinsMape = xgboostMatrix.mape < sarimaMatrix.mape;
    const winnerName = xgbWinsMape ? "XGBoost" : "SARIMA";
    const loserName = xgbWinsMape ? "SARIMA" : "XGBoost";
    const winnerColor = xgbWinsMape ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400";

    const rmsePctDiff = sarimaMatrix.rmse !== 0 ? (rmseDiff / Math.max(sarimaMatrix.rmse, xgboostMatrix.rmse)) * 100 : 0;

    useEffect(() => {
        let chart;
        let isMounted = true;
        let cancelled = false;

        Promise.all([import("chart.js/auto"), import("chartjs-plugin-zoom")]).then(([{ default: Chart }, { default: zoomPlugin }]) => {
            if (!isMounted || cancelled || !overlayRef.current) return;

            Chart.register(zoomPlugin);
            const d = getChartDefaults();

            chart = new Chart(overlayRef.current, {
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
                            borderWidth: 3,
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            pointBackgroundColor: "#2563eb",
                            order: 1,
                        },
                        {
                            label: "SARIMA",
                            data: sarimaValue,
                            spanGaps: true,
                            borderColor: "#db2777",
                            backgroundColor: "transparent",
                            borderWidth: 2,
                            borderDash: [6, 3],
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            order: 2,
                        },
                        {
                            label: "XGBoost",
                            data: xgbValue,
                            spanGaps: true,
                            borderColor: "#16a34a",
                            backgroundColor: "transparent",
                            borderWidth: 2,
                            borderDash: [3, 3],
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                            order: 3,
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
                            labels: { boxWidth: 14, font: { size: 12 }, color: d.tickColor },
                        },
                        tooltip: {
                            mode: "index",
                            intersect: false,
                            backgroundColor: d.tooltipBg,
                            titleColor: d.tooltipTitle,
                            bodyColor: d.tooltipBody,
                            borderColor: d.tooltipBorder,
                            borderWidth: 1,
                            padding: 10,
                            cornerRadius: 8,
                        },
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
                            ticks: { color: d.tickColor, font: { size: 11 }, maxTicksLimit: 12 },
                        },
                        y: {
                            grid: { color: d.gridColor },
                            ticks: { color: d.tickColor, font: { size: 11 } },
                            title: { display: true, text: "Konsumsi (kg)", color: d.tickColor, font: { size: 11 } },
                        },
                    },
                },
            });
        });

        return () => {
            isMounted = false;
            cancelled = true;
            chart?.destroy();
        };
    }, [chartLabels, actualValue, sarimaValue, xgbValue]);

    return (
        <div className="space-y-6">
            {/* Winner cards side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SARIMA */}
                <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-blue-200 dark:border-blue-800/50 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">SARIMA</h3>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">Statistik Klasik</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { k: "MAPE", v: `${sarimaMatrix.mape.toFixed(2)}%`, c: "text-blue-600 dark:text-blue-400" },
                            { k: "RMSE", v: sarimaMatrix.rmse.toFixed(2), c: "text-slate-700 dark:text-slate-300" },
                            { k: "MAE", v: sarimaMatrix.mae.toFixed(2), c: "text-slate-700 dark:text-slate-300" },
                        ].map((item) => (
                            <div key={item.k} className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.k}</p>
                                <p className={`text-xl font-bold ${item.c}`}>{item.v}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* XGBoost */}
                <div className="relative p-5 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2 border-orange-400 dark:border-orange-500 shadow-sm">
                    {xgbWinsMape && <span className="absolute -top-3 right-4 text-xs font-bold px-3 py-0.5 rounded-full bg-orange-500 text-white shadow">⭐ Lebih Akurat</span>}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">XGBoost</h3>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">Machine Learning</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { k: "MAPE", v: `${xgboostMatrix.mape.toFixed(2)}%`, c: "text-orange-600 dark:text-orange-400" },
                            { k: "RMSE", v: xgboostMatrix.rmse.toFixed(2), c: "text-slate-700 dark:text-slate-300" },
                            { k: "MAE", v: xgboostMatrix.mae.toFixed(2), c: "text-slate-700 dark:text-slate-300" },
                        ].map((item) => (
                            <div key={item.k} className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.k}</p>
                                <p className={`text-xl font-bold ${item.c}`}>{item.v}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Overlay chart */}
            <SectionCard title="📊 Overlay: Aktual vs SARIMA vs XGBoost">
                <div className="relative h-72 lg:h-96">
                    <canvas ref={overlayRef} />
                </div>
            </SectionCard>

            {/* Conclusion */}
            <div className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/60 dark:bg-slate-800/40">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">💡 Kesimpulan</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong className={winnerColor}>{winnerName}</strong> menghasilkan performa lebih baik dari {loserName} pada metrik utama — MAPE lebih rendah <strong className={winnerColor}>{mapeDiff.toFixed(2)}%</strong>, RMSE lebih rendah <strong className={winnerColor}>{rmsePctDiff.toFixed(1)}%</strong>, dan MAE lebih rendah <strong className={winnerColor}>{maeDiff.toFixed(2)}</strong>.{" "}
                    {xgbWinsMape ? "XGBoost mampu menangkap pola non-linear dari fitur lag dan fitur kalender (hari kerja, musiman)." : "SARIMA lebih unggul menangkap pola musiman dan tren dari data time series ini."} {loserName} tetap relevan sebagai <em>baseline</em> pembanding yang mudah diinterpretasi.
                </p>
            </div>
        </div>
    );
}
