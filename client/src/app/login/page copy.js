"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/authService";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email.trim() || !form.password) return;

        setLoading(true);
        setError("");
        try {
            await loginUser({ email: form.email.trim(), password: form.password });
            router.push("/dashboard");
        } catch (err) {
            setError(err?.response?.data?.detail || err.message || "Login gagal. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* ── Background dot pattern, smooth ───────────────────────── */}
            <div
                className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
                style={{
                    backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />
            {/* Soft gradient glow blobs supaya dot pattern nggak flat */}

            <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 dark:bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-300/30 dark:bg-pink-600/10 rounded-full blur-3xl" />
            {/* Fade dot pattern di tepi biar smooth, bukan abrupt cutoff */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-transparent to-slate-50/60 dark:from-slate-950/60 dark:via-transparent dark:to-slate-950/60" />

            {/* ── Card login ─────────────────────────────────────────── */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="text-center mb-8 fade-in">
                    <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-pink-600 items-center justify-center text-2xl mb-4 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">📈</div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">ForecastBoard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Masuk untuk melanjutkan peramalan Anda</p>
                </div>

                <form onSubmit={handleSubmit} className="p-7 rounded-2xl glass-effect border border-blue-200 dark:border-slate-700 shadow-xl shadow-blue-100/50 dark:shadow-none fade-in">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                        <input type="email" name="email" placeholder="nama@email.com" value={form.email} onChange={handleChange} autoComplete="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition" />
                    </div>

                    <div className="mb-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={form.password} onChange={handleChange} autoComplete="current-password" className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition" />
                            <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" tabIndex={-1}>
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-3 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40">
                            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <button type="submit" disabled={!form.email.trim() || !form.password || loading} className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            "Masuk"
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">© 2026 ForecastBoard · SARIMA &amp; XGBoost Forecasting</p>
            </div>
        </div>
    );
}
