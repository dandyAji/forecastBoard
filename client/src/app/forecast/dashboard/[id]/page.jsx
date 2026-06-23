"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AppSidebar } from "@/components/layout/sidebar";
import { getActualData, getSarimaData, getXGBoostData, getForecastDetail } from "@/services/forecastService";

// Lazy-load tab panels — charts use canvas so they must be client-only
const TabDataAsli = dynamic(() => import("@/components/dashboard/TabDataAsli"), { ssr: false });
const TabSarima = dynamic(() => import("@/components/dashboard/TabSarima"), { ssr: false });
const TabXGBoost = dynamic(() => import("@/components/dashboard/TabXGBoost"), { ssr: false });
const TabHasil = dynamic(() => import("@/components/dashboard/TabHasil"), { ssr: false });

const TABS = [
    { id: 0, label: "Data Asli", shortLabel: "Data", dot: "bg-slate-400", panel: TabDataAsli },
    { id: 1, label: "SARIMA", shortLabel: "SARIMA", dot: "bg-blue-500", panel: TabSarima },
    { id: 2, label: "XGBoost", shortLabel: "XGBoost", dot: "bg-orange-500", panel: TabXGBoost },
    { id: 3, label: "Hasil & Perbandingan", shortLabel: "Hasil", dot: "bg-purple-500", panel: TabHasil },
];

export default function DashboardPage({ params }) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState(0);
    const [dataActual, setActualData] = useState([]);
    const [dataSarima, setSarimaData] = useState([]);
    const [dataXGBoost, setXGBoostData] = useState([]);
    const [forecastInfo, setForecastInfo] = useState(null); // ✅ state baru untuk title & description
    const [error, setError] = useState(null);

    const tabDataMap = {
        0: dataActual,
        1: { sarima: dataSarima, actual: dataActual },
        2: { xgboost: dataXGBoost, actual: dataActual },
        3: { actual: dataActual, sarima: dataSarima, xgboost: dataXGBoost },
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const [detail, actual, sarima, xgboost] = await Promise.all([getForecastDetail(id), getActualData(id), getSarimaData(id), getXGBoostData(id)]);
                setForecastInfo(detail.data); // ✅ sesuaikan dengan bentuk respons API kamu
                setActualData(actual);
                setSarimaData(sarima);
                setXGBoostData(xgboost);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchData();
    }, [id]);

    return (
        <div className="flex min-h-screen">
            <AppSidebar link="forecast" />

            <main className="flex-1 lg:ml-64 w-full transition-all duration-300">
                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    {/* ── Header ─────────────────────────────────────────────── */}
                    <div className="mb-6 fade-in">
                        <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-1">{forecastInfo?.title ?? "Memuat..."}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{forecastInfo?.description ?? "Analisis data time series konsumsi plastik PE harian dengan metode SARIMA & XGBoost"}</p>
                    </div>

                    {/* ── Tab Navigation ──────────────────────────────────────── */}
                    <div className="mb-6">
                        {/* Mobile: scrollable pill tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:hidden">
                            {TABS.map((tab) => {
                                const active = activeTab === tab.id;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${active ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-white" : tab.dot}`} />
                                        {tab.shortLabel}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Desktop: underline tabs */}
                        <div className="hidden sm:flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-hide" role="tablist">
                            {TABS.map((tab) => {
                                const active = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => {
                                            console.log("klik tab", tab.id);
                                            console.log("data tab", tabDataMap[tab.id]);
                                            setActiveTab(tab.id);
                                        }}
                                        className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${active ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500"}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-opacity ${active ? "opacity-100" : "opacity-40"} ${tab.dot}`} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Tab Panels ─────────────────────────────────────────── */}
                    <div>
                        {TABS.map((tab) => {
                            const Panel = tab.panel;
                            if (activeTab === tab.id) {
                                console.log("Rendering tab:", tab.label);
                            }
                            return (
                                <div key={tab.id} role="tabpanel" hidden={activeTab !== tab.id}>
                                    {activeTab === tab.id &&
                                        (() => {
                                            console.log("Mounting panel untuk tab:", tab.label);
                                            return <Panel data={tabDataMap[tab.id]} />;
                                        })()}
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Footer ─────────────────────────────────────────────── */}
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs mt-4">© 2026 Fadilah Yunisyah · SARIMA Dashboard · Data Science &amp; Forecasting</div>
                </div>
            </main>
        </div>
    );
}
