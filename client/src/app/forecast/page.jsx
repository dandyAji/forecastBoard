"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/sidebar";
import Link from "next/link";
import { getForecastList } from "@/services/forecastService";

const StatusBadge = ({ status }) => {
    const map = {
        completed: {
            label: "Selesai",
            cls: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
            dot: "bg-emerald-500",
        },
        processing: {
            label: "Proses",
            cls: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
            dot: "bg-amber-400 animate-pulse",
        },
        failed: {
            label: "Gagal",
            cls: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
            dot: "bg-red-500",
        },
    };
    const { label, cls, dot } = map[status] || map.processing;
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {label}
        </span>
    );
};

const MethodBadge = ({ method }) => {
    const cls = method === "SARIMA" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" : "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300";
    return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{method}</span>;
};

export default function UploadData() {
    const [forecasts, setForecasts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [form, setForm] = useState({ title: "", description: "", file: null });
    const [fileError, setFileError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchForecasts() {
            try {
                setLoading(true);
                const dataForecast = await getForecastList();
                console.log(dataForecast.data);
                setForecasts(dataForecast.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchForecasts();
    }, []);

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const allowed = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv"];
        if (!allowed.includes(f.type) && !f.name.match(/\.(xlsx|xls|csv)$/i)) {
            setFileError("Hanya file .xlsx, .xls, atau .csv yang diizinkan.");
            setForm((p) => ({ ...p, file: null }));
            return;
        }
        setFileError("");
        setForm((p) => ({ ...p, file: f }));
    };

    const handleSubmit = () => {
        if (!form.title.trim() || !form.file) return;
        setSubmitting(true);
        setTimeout(() => {
            const newForecast = {
                id: Date.now(),
                title: form.title.trim(),
                description: form.description.trim() || "-",
                file: form.file.name,
                method: "SARIMA",
                status: "processing",
                createdAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
                accuracy: "-",
            };
            setForecasts((p) => [newForecast, ...p]);
            setForm({ title: "", description: "", file: null });
            setSubmitting(false);
            setShowModal(false);

            console.log(newForecast);
        }, 800);
    };

    const handleDelete = (id) => {
        setForecasts((p) => p.filter((f) => f.id !== id));
        setDeleteId(null);
    };

    return (
        <>
            <div className="flex min-h-screen">
                <AppSidebar link="forecast" />

                <main className="flex-1 lg:ml-64 w-full transition-all duration-300 flex flex-col min-h-screen">
                    <div className="p-4 lg:p-8 max-w-7xl mx-auto flex-grow w-full">
                        {/* ── Header ── */}
                        <div className="mb-8 fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-1">Data Forecasting</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola dan pantau semua sesi peramalan SARIMA &amp; XGBoost Anda.</p>
                            </div>
                            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:opacity-90 transition-opacity shadow-md shadow-blue-200 dark:shadow-blue-900/30 whitespace-nowrap">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Buat Forecast
                            </button>
                        </div>
                        {console.log("forecast nya", forecasts)}
                        {/* ── Stats strip ── */}
                        <div className="grid grid-cols-3 gap-3 mb-8 fade-in">
                            {[
                                { label: "Total Forecast", value: forecasts.length, icon: "📊" },
                                { label: "Selesai", value: forecasts.filter((f) => f.still_process == false).length, icon: "✅" },
                                { label: "Diproses", value: forecasts.filter((f) => f.still_process == true).length, icon: "⏳" },
                            ].map((s) => (
                                <div key={s.label} className="p-4 rounded-2xl glass-effect border border-blue-200 dark:border-slate-700 text-center">
                                    <div className="text-xl mb-1">{s.icon}</div>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* ── Forecast List ── */}
                        <div className="fade-in space-y-4">
                            {forecasts.length === 0 && (
                                <div className="py-20 text-center rounded-2xl glass-effect border border-blue-200 dark:border-slate-700">
                                    <div className="text-4xl mb-3">📂</div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        Belum ada forecast. Klik <strong>Buat Forecast</strong> untuk mulai.
                                    </p>
                                </div>
                            )}

                            {forecasts.map((fc) => (
                                <div key={fc.id} className="p-5 rounded-2xl glass-effect border border-blue-200 dark:border-slate-700 card-hover transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                        {/* Icon */}
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-pink-100 dark:from-blue-900/40 dark:to-pink-900/40 flex items-center justify-center text-xl flex-shrink-0">📈</div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">{fc.title}</h3>
                                                {/* <MethodBadge method={fc.method} /> */}
                                                <StatusBadge status={!fc.still_process ? "completed" : "processing"} />
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{fc.description}</p>

                                            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
                                                {/* <span className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    {fc.file}
                                                </span> */}
                                                <span className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {fc.createdAt}
                                                </span>
                                                {/* {fc.accuracy !== "-" && (
                                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                        Akurasi {fc.accuracy}
                                                    </span>
                                                )} */}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                                            {fc.still_process == false && (
                                                <Link href={`/forecast/dashboard/${fc.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Lihat
                                                </Link>
                                            )}
                                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                            <button onClick={() => setDeleteId(fc.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <footer className="w-full py-6 text-center text-slate-400 dark:text-slate-500 text-xs border-t border-slate-200 dark:border-slate-800 mt-8">© 2026 Fadilah Yunisyah · SARIMA Dashboard · Data Science &amp; Forecasting</footer>
                </main>
            </div>

            {/* ══ Modal Create Forecast ══ */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowModal(false)} />

                    {/* Panel */}
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-slate-700 overflow-hidden">
                        {/* Modal header */}
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Buat Forecast Baru</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Isi detail dan unggah file data untuk memulai peramalan.</p>
                            </div>
                            <button onClick={() => !submitting && setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="px-6 py-5 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Judul Forecast <span className="text-pink-500">*</span>
                                </label>
                                <input type="text" placeholder="Contoh: Forecast PE Q3 2026" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition" />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Deskripsi</label>
                                <textarea rows={3} placeholder="Jelaskan tujuan atau konteks peramalan ini..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition resize-none" />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    File Data <span className="text-pink-500">*</span>
                                </label>
                                <label className="flex flex-col items-center justify-center gap-2 w-full p-5 rounded-xl border-2 border-dashed border-blue-200 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer">
                                    {form.file ? (
                                        <>
                                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xl">✅</div>
                                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{form.file.name}</span>
                                            <span className="text-xs text-slate-400">Klik untuk ganti file</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xl">📁</div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Pilih atau seret file ke sini</span>
                                            <span className="text-xs text-slate-400">Format: .xlsx, .xls, .csv</span>
                                        </>
                                    )}
                                    <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
                                </label>
                                {fileError && <p className="mt-1.5 text-xs text-red-500">{fileError}</p>}
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button onClick={() => !submitting && setShowModal(false)} disabled={submitting} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                                Batal
                            </button>
                            <button onClick={handleSubmit} disabled={!form.title.trim() || !form.file || submitting} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Buat Forecast
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Modal Konfirmasi Hapus ══ */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-100 dark:border-slate-700 p-6">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-2xl">🗑️</div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Hapus Forecast?</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Data forecast ini akan dihapus permanen dan tidak bisa dikembalikan.</p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 transition-colors">
                                Batal
                            </button>
                            <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90 transition-opacity">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
