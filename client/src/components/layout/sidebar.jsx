"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/services/authService"; // sesuaikan path kalau file api.js-nya beda lokasi

export function AppSidebar({ link }) {
    const router = useRouter();
    console.log("Halaman aktif saat ini:", link);

    function handleLogout() {
        logoutUser();
        router.push("/login");
    }

    return (
        <>
            <aside id="sidebar" className="sidebar closed fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-50 via-pink-50 to-white dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 shadow-xl z-40 lg:translate-x-0 overflow-y-auto scrollbar-hide">
                <div className="p-6 border-b border-blue-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">📊</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">ForecastBoard</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">SARIMA × XGBoost</p>
                        </div>
                    </div>
                </div>
                <nav className="p-4 space-y-2">
                    {/* Menu Dashboard */}
                    <Link href="/dashboard" className={`menu-item flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition-colors ${link === "forecast" ? "active bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-blue-400 font-bold" : "hover:bg-blue-50 dark:hover:bg-slate-700"}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 14l4-4 4 4 5-6" />
                        </svg>
                        <span>Peramalan</span>
                    </Link>
                    {/* Menu Upload Data */}
                    {/* <Link href="/forecast" className={`menu-item w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition-colors ${link === "forecast" ? "active bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-blue-400 font-bold" : "hover:bg-blue-50 dark:hover:bg-slate-700"}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                        <span>Peramalan</span>
                    </Link> */}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-100 dark:border-slate-700 bg-gradient-light dark:bg-slate-800 space-y-3">
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-600 dark:text-slate-300">
                        <p className="font-semibold text-blue-600 dark:text-pink-400 mb-1">💡 Tips</p>
                        <p className="text-xs">Upload file Excel untuk menganalisis data</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 dark:hover:text-red-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
