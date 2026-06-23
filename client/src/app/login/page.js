"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import Image from "next/image";
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
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-200 via-blue-50 to-purple-100 p-4">
            {/* ── Background dot pattern, smooth ───────────────────────── */}
            <div
                className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
                style={{
                    backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />
            {/* Soft gradient glow blobs supaya dot pattern nggak flat */}
            <div className="w-full max-w-5xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/40 hover:shadow-blue-300/60 hover:-translate-y-1 transition-all duration-500 ease-in-out overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Left Panel */}
                <div className="relative flex flex-col items-center justify-center gap-6 w-full md:w-[45%] bg-gradient-to-br from-slate-50/80 to-blue-50/60 p-10 border-b md:border-b-0 md:border-r border-white/60">
                    {/* Decorative blobs */}
                    <div className="absolute top-0 left-0 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />

                    {/* Logo Card */}
                    <div className="relative bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-10 flex items-center justify-center w-full max-w-xs aspect-square">
                        {/* Logo SVG */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3">
                                <Image src="/logo.png" alt="SARIMA Analytics Logo" width={500} height={100} sizes="100vw" className="w-full h-auto" />
                            </div>
                        </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-center text-sm text-slate-400 max-w-xl leading-relaxed">dashboard forecast sarima & XGBoost untuk memproyeksikan tren masa depan bisnis Anda.</p>

                    {/* Footer left */}
                    <p className="absolute bottom-5 left-6 text-xs text-slate-300 hidden md:block">© 2026 ForecastBoard. All rights reserved.</p>
                </div>

                {/* Right Panel - Form */}
                <div className="flex flex-col justify-center w-full md:w-[55%] p-8 sm:p-12">
                    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Selamat Datang Kembali</h1>
                        <p className="text-slate-500 text-sm mb-8">Silakan masuk untuk melihat data Anda.</p>

                        <div className="space-y-5">
                            {/* Email */}
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

                            {/* Login Button */}
                            <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm tracking-wide bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 hover:from-blue-500 hover:to-fuchsia-400 shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
                                Login
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    {/* Mobile footer */}
                    <p className="text-center text-xs text-slate-300 mt-8 md:hidden">© 2024 SARIMA Analytics. All rights reserved.</p>

                    {/* Desktop footer links */}
                    <div className="hidden md:flex justify-end gap-4 mt-8">
                        {["Kebijakan Privasi", "Ketentuan Layanan", "Dukungan"].map((item) => (
                            <a key={item} href="#" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
