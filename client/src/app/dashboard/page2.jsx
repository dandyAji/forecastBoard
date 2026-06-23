import { AppSidebar } from "@/components/layout/sidebar";

export default function DashboardPage() {
    return (
        <>
            <div class="flex min-h-screen ">
                <AppSidebar />
                <main className="flex-1 lg:ml-64 w-full transition-all duration-300">
                    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                        <div className="fade-in mb-8">
                            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">Dashboard Peramalan SARIMA</h2>
                            <p className="text-slate-600 dark:text-slate-400">Analisis data time series dengan metode SARIMA (Seasonal AutoRegressive Integrated Moving Average)</p>
                        </div>
                        <div id="uploadSection" className="mb-8 p-6 rounded-2xl glass-effect card-hover border border-blue-200 dark:border-slate-700 cursor-pointer" hidden>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">📁 Import Data</h3>
                                <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">Excel (.xlsx, .csv)</span>
                            </div>
                            <label className="block cursor-pointer">
                                <input type="file" id="fileInput" accept=".xlsx,.csv,.xls" className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-slate-700 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Drag & drop atau klik untuk memilih file</p>
                            </label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="metric-card p-6 rounded-2xl glass-effect card-hover border border-blue-100 dark:border-slate-700">
                                <div className="metric-content">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">MAPE</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">2.34%</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Mean Absolute Percentage</p>
                                </div>
                            </div>
                            <div className="metric-card p-6 rounded-2xl glass-effect card-hover border border-pink-100 dark:border-slate-700">
                                <div className="metric-content">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">RMSE</p>
                                    <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">156.78</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Root Mean Square Error</p>
                                </div>
                            </div>
                            <div className="metric-card p-6 rounded-2xl glass-effect card-hover border border-purple-100 dark:border-slate-700">
                                <div className="metric-content">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">MAE</p>
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">98.45</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Mean Absolute Error</p>
                                </div>
                            </div>
                            <div className="metric-card p-6 rounded-2xl glass-effect card-hover border border-cyan-100 dark:border-slate-700">
                                <div className="metric-content">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">R² Score</p>
                                    <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">0.9847</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Coefficient of Determination</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="p-6 rounded-2xl glass-effect card-hover border border-blue-100 dark:border-slate-700 col-span-1 lg:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">📈 Grafik Peramalan</h3>
                                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center gap-1">
                                        <span className="pulse-dot w-2 h-2 rounded-full bg-green-500"></span>Live
                                    </span>
                                </div>
                                <div className="relative h-80 lg:h-96">
                                    <canvas id="forecastChart"></canvas>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl glass-effect card-hover border border-pink-100 dark:border-slate-700" hidden>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">📊 Distribusi Error</h3>
                                <div className="relative h-80">
                                    <canvas id="errorChart"></canvas>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl glass-effect card-hover border border-purple-100 dark:border-slate-700" hidden>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">📉 Residual Plot</h3>
                                <div className="relative h-80">
                                    <canvas id="residualChart"></canvas>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="p-6 rounded-2xl glass-effect card-hover border border-blue-100 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">📋 Data Aktual</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                                <th className="text-left py-2 px-2 font-semibold text-slate-600 dark:text-slate-400">Periode</th>
                                                <th className="text-right py-2 px-2 font-semibold text-slate-600 dark:text-slate-400">Nilai</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">Jan 2024</td>
                                                <td className="text-right py-2 px-2 font-medium text-blue-600 dark:text-blue-400">1,250.5</td>
                                            </tr>
                                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">Feb 2024</td>
                                                <td className="text-right py-2 px-2 font-medium text-blue-600 dark:text-blue-400">1,340.8</td>
                                            </tr>
                                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">Mar 2024</td>
                                                <td className="text-right py-2 px-2 font-medium text-blue-600 dark:text-blue-400">1,420.3</td>
                                            </tr>
                                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">Apr 2024</td>
                                                <td className="text-right py-2 px-2 font-medium text-blue-600 dark:text-blue-400">1,580.6</td>
                                            </tr>
                                            <tr className="hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">May 2024</td>
                                                <td className="text-right py-2 px-2 font-medium text-blue-600 dark:text-blue-400">1,720.2</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl glass-effect card-hover border border-pink-100 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">🎯 Data Peramalan</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                                <th className="text-left py-2 px-2 font-semibold text-slate-600 dark:text-slate-400">Periode</th>
                                                <th className="text-right py-2 px-2 font-semibold text-slate-600 dark:text-slate-400">Prediksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">Jun 2024</td>
                                                <td className="text-right py-2 px-2 font-medium text-pink-600 dark:text-pink-400">1,835.4</td>
                                            </tr>
                                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">Jul 2024</td>
                                                <td className="text-right py-2 px-2 font-medium text-pink-600 dark:text-pink-400">1,950.7</td>
                                            </tr>
                                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">Aug 2024</td>
                                                <td className="text-right py-2 px-2 font-medium text-pink-600 dark:text-pink-400">2,045.1</td>
                                            </tr>
                                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">Sep 2024</td>
                                                <td className="text-right py-2 px-2 font-medium text-pink-600 dark:text-pink-400">2,180.3</td>
                                            </tr>
                                            <tr className="hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">Oct 2024</td>
                                                <td className="text-right py-2 px-2 font-medium text-pink-600 dark:text-pink-400">2,310.6</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl glass-effect card-hover border border-blue-100 dark:border-slate-700 mb-8 fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">📊 Perbandingan Detail: Aktual vs Prediksi</h3>
                                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Metric: APE (%)</span>
                            </div>

                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">Periode</th>
                                            <th className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Nilai Aktual</th>
                                            <th className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Prediksi</th>
                                            <th className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Error (APE %)</th>
                                            <th className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <tr className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">Jan 2024</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">8,234</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">8,156</td>
                                            <td className="py-4 px-4 text-right font-bold text-green-500">0.94%</td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Sangat Baik</span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">Feb 2024</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">8,567</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">8,612</td>
                                            <td className="py-4 px-4 text-right font-bold text-green-500">0.52%</td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Sangat Baik</span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">Mar 2024</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">9,123</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">9,087</td>
                                            <td className="py-4 px-4 text-right font-bold text-orange-500">0.39%</td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Sangat Baik</span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">Apr 2024</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">8,956</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">9,012</td>
                                            <td className="py-4 px-4 text-right font-bold text-orange-500">0.62%</td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">Baik</span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">May 2024</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">9,345</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">9,289</td>
                                            <td className="py-4 px-4 text-right font-bold text-green-500">0.59%</td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Sangat Baik</span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">Jun 2024</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">9,678</td>
                                            <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400">9,634</td>
                                            <td className="py-4 px-4 text-right font-bold text-green-500">0.45%</td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Sangat Baik</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="text-center py-8 text-slate-600 dark:text-slate-400 text-sm">
                            <p>© 2026 Fadilah Yunisyah • SARIMA Dashboard • Data Science & Forecasting</p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
