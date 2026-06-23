"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/sidebar";
import { getForecastList, createForecast } from "@/services/forecastService";

const STATUS_STYLES = {
    completed: { label: "Selesai", dot: "bg-emerald-500", badge: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
    processing: { label: "Diproses", dot: "bg-amber-500", badge: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
    failed: { label: "Gagal", dot: "bg-red-500", badge: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
};

function StatusBadge({ status }) {
    const s = status ? STATUS_STYLES.processing : STATUS_STYLES.completed;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${Math.floor(diffHours)} jam lalu`;
    if (diffDays < 7) return `${Math.floor(diffDays)} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function getGreeting(userName) {
    const hour = new Date().getHours();
    let greeting = "Selamat malam";
    if (hour < 11) greeting = "Selamat pagi";
    else if (hour < 15) greeting = "Selamat siang";
    else if (hour < 18) greeting = "Selamat sore";

    return userName ? `${greeting}, ${userName}` : greeting;
}

function getCurrentUser() {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export default function HomePage() {
    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── State untuk modal create forecast (insert) ─────────────────────
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", file: null });
    const [fileError, setFileError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        setCurrentUser(getCurrentUser());
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const result = await getForecastList({ page: 1, limit: 50 });
            setForecasts(Array.isArray(result?.data) ? result.data : []);
        } catch (err) {
            console.log(err.response);
            setError(err.response.data.detail ?? err.message);
        } finally {
            setLoading(false);
        }
    }

    const total = forecasts.length;
    const completed = forecasts.filter((f) => f.still_process === false).length;
    const processing = forecasts.filter((f) => f.still_process === true).length;
    const recentForecasts = [...forecasts];

    // ── Handler modal create forecast ──────────────────────────────────
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

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.file) return;
        setSubmitting(true);
        setSubmitError("");
        try {
            await createForecast({
                title: form.title.trim(),
                description: form.description.trim(),
                file: form.file,
            });
            setForm({ title: "", description: "", file: null });
            setShowModal(false);
            await fetchData(); // refresh list dari server setelah insert berhasil
        } catch (err) {
            console.log(err?.response);
            setSubmitError(err?.response?.data?.detail || err.message || "Gagal membuat forecast.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex min-h-screen">
                <AppSidebar link="forecast" />

                <main className="flex-1 lg:ml-64 w-full transition-all duration-300">
                    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                        {/* ── Greeting ───────────────────────────────────────────── */}
                        <div className="mb-8 fade-in">
                            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-1">{getGreeting(currentUser?.name)} 👋</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Ini ringkasan aktivitas peramalan Anda.</p>
                        </div>

                        {/* ── Stats strip ────────────────────────────────────────── */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 fade-in">
                            <div className="p-5 rounded-2xl glass-effect border border-blue-200 dark:border-slate-700 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-pink-100 dark:from-blue-900/40 dark:to-pink-900/40 flex items-center justify-center text-2xl flex-shrink-0">📊</div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loading ? "—" : total}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Total Forecast</div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl glass-effect border border-blue-200 dark:border-slate-700 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl flex-shrink-0">✅</div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loading ? "—" : completed}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Selesai</div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl glass-effect border border-blue-200 dark:border-slate-700 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl flex-shrink-0">⏳</div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{loading ? "—" : processing}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Diproses</div>
                                </div>
                            </div>
                        </div>

                        {/* ── Shortcut: Buat Forecast (buka modal insert) ────────── */}
                        <button onClick={() => setShowModal(true)} className="block w-full text-left mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-pink-600 hover:opacity-95 transition-opacity shadow-md shadow-blue-200 dark:shadow-blue-900/30 fade-in">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-1">Mulai Peramalan Baru</h3>
                                    <p className="text-blue-50 text-sm">Unggah data konsumsi dan jalankan analisis SARIMA & XGBoost</p>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                        </button>

                        {/* ── Recent forecasts ───────────────────────────────────── */}
                        <div className="fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Peramalan Terbaru</h3>
                            </div>

                            {/* Container scroll — tinggi dibatasi, list di dalamnya yang scroll */}
                            <div className="max-h-[320px] overflow-y-auto pr-1 space-y-3">
                                {loading && (
                                    <div className="py-16 text-center rounded-2xl glass-effect border border-blue-200 dark:border-slate-700">
                                        <p className="text-slate-400 dark:text-slate-500 text-sm">Memuat data...</p>
                                    </div>
                                )}
                                {!loading && error && (
                                    <div className="py-16 text-center rounded-2xl glass-effect border border-red-200 dark:border-red-900/40">
                                        <p className="text-red-500 text-sm">Gagal memuat data: {error}</p>
                                    </div>
                                )}
                                {!loading && !error && recentForecasts.length === 0 && (
                                    <div className="py-16 text-center rounded-2xl glass-effect border border-blue-200 dark:border-slate-700">
                                        <div className="text-3xl mb-2">📂</div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                                            Belum ada forecast. Klik <strong>Mulai Peramalan Baru</strong> di atas.
                                        </p>
                                    </div>
                                )}
                                {!loading &&
                                    !error &&
                                    recentForecasts.map((fc) => (
                                        <Link key={fc.id} href={`/forecast/dashboard/${fc.id}`} className="block p-4 rounded-2xl glass-effect border border-blue-200 dark:border-slate-700 card-hover transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-pink-100 dark:from-blue-900/40 dark:to-pink-900/40 flex items-center justify-center text-lg flex-shrink-0">📈</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{fc.title}</h4>
                                                        <StatusBadge status={fc.still_process} />
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{fc.description || "-"}</p>
                                                </div>
                                                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">{formatRelativeDate(fc.createdAt)}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        // setDeleteId(fc.id);
                                                    }}
                                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                                                    aria-label="Hapus forecast"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </Link>
                                    ))}
                            </div>
                        </div>

                        {/* ── Footer ─────────────────────────────────────────────── */}
                        <footer className="w-full py-6 text-center text-slate-400 dark:text-slate-500 text-xs border-t border-slate-200 dark:border-slate-800 mt-8">© 2026 Fadilah Yunisyah · SARIMA Dashboard · Data Science &amp; Forecasting</footer>
                    </div>
                </main>
            </div>

            {/* ══ Modal Create Forecast (Insert) ══ */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setShowModal(false)} />

                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-slate-700 overflow-hidden">
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

                        <div className="px-6 py-5 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Judul Forecast <span className="text-pink-500">*</span>
                                </label>
                                <input type="text" placeholder="Contoh: Forecast PE Q3 2026" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Deskripsi</label>
                                <textarea rows={3} placeholder="Jelaskan tujuan atau konteks peramalan ini..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition resize-none" />
                            </div>

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

                            {submitError && (
                                <div className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40">
                                    <p className="text-xs text-red-600 dark:text-red-400">{submitError}</p>
                                </div>
                            )}
                        </div>

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
        </>
    );
}
