// ─── Raw / Actual Data ────────────────────────────────────────────────
export const months = [
  "Jan 2024","Feb 2024","Mar 2024","Apr 2024",
  "Mei 2024","Jun 2024","Jul 2024","Agu 2024",
  "Sep 2024","Okt 2024","Nov 2024","Des 2024",
];

export const actualValues = [
  8234, 8567, 9123, 8956, 9345, 9678,
  10124, 10580, 10234, 10890, 11245, 11780,
];

export const rawTableData = [
  { no: 1,  period: "Jan 2024", value: 8234,  delta: +382,  trend: "up"   },
  { no: 2,  period: "Feb 2024", value: 8567,  delta: +333,  trend: "up"   },
  { no: 3,  period: "Mar 2024", value: 9123,  delta: +556,  trend: "up"   },
  { no: 4,  period: "Apr 2024", value: 8956,  delta: -167,  trend: "down" },
  { no: 5,  period: "Mei 2024", value: 9345,  delta: +389,  trend: "up"   },
  { no: 6,  period: "Jun 2024", value: 9678,  delta: +333,  trend: "up"   },
  { no: 7,  period: "Jul 2024", value: 10124, delta: +446,  trend: "up"   },
  { no: 8,  period: "Agu 2024", value: 10580, delta: +456,  trend: "up"   },
  { no: 9,  period: "Sep 2024", value: 10234, delta: -346,  trend: "down" },
  { no: 10, period: "Okt 2024", value: 10890, delta: +656,  trend: "up"   },
  { no: 11, period: "Nov 2024", value: 11245, delta: +355,  trend: "up"   },
  { no: 12, period: "Des 2024", value: 11780, delta: +535,  trend: "up"   },
];

// ─── SARIMA Data ───────────────────────────────────────────────────────
export const sarimaMetrics = {
  mape:  { value: "2.34%", label: "MAPE",    sub: "Mean Absolute Percentage", color: "blue"   },
  rmse:  { value: "156.78", label: "RMSE",   sub: "Root Mean Square Error",   color: "pink"   },
  mae:   { value: "98.45",  label: "MAE",    sub: "Mean Absolute Error",      color: "purple" },
  r2:    { value: "0.9847", label: "R² Score", sub: "Coefficient of Determination", color: "cyan" },
};

export const sarimaForecastLabels = [
  ...months, "Jan 2025", "Feb 2025", "Mar 2025",
];

export const sarimaPredicted = [
  8156, 8612, 9087, 9012, 9289, 9634,
  10078, 10498, 10189, 10754, 11102, 11634,
  null, null, null,
];

export const sarimaForecastOnly = [
  null, null, null, null, null, null,
  null, null, null, null, null, 11634,
  12100, 12380, 12650,
];

export const sarimaCI_upper = [
  null, null, null, null, null, null,
  null, null, null, null, null, null,
  12320, 12620, 12910,
];

export const sarimaCI_lower = [
  null, null, null, null, null, null,
  null, null, null, null, null, null,
  11880, 12140, 12390,
];

export const sarimaResiduals = [
  78, -45, 36, -56, 56, 44,
  46, 82, 45, 136, 143, 146,
];

export const acfValues = [
  0.38, -0.12, 0.09, -0.05, 0.07, -0.03,
  0.29, -0.08, 0.04, -0.02, 0.06, -0.01, 0.03, -0.02,
];

export const sarimaParams = [
  { key: "p (AR)",     val: "2"      },
  { key: "d (I)",      val: "1"      },
  { key: "q (MA)",     val: "1"      },
  { key: "P (SAR)",    val: "1"      },
  { key: "D (SI)",     val: "1"      },
  { key: "Q (SMA)",    val: "1"      },
  { key: "s (Musiman)",val: "7"      },
  { key: "AIC",        val: "1842.3" },
];

// ─── XGBoost Data ──────────────────────────────────────────────────────
export const xgbMetrics = {
  mape: { value: "1.87%",  label: "MAPE",    sub: "Mean Absolute Percentage", color: "orange" },
  rmse: { value: "124.52", label: "RMSE",    sub: "Root Mean Square Error",   color: "amber"  },
  mae:  { value: "82.31",  label: "MAE",     sub: "Mean Absolute Error",      color: "green"  },
  r2:   { value: "0.9912", label: "R² Score", sub: "Coefficient of Determination", color: "cyan" },
};

export const xgbPredicted = [
  8189, 8534, 9108, 8921, 9367, 9701,
  10145, 10612, 10189, 10934, 11318, 11850,
];

export const featureImportance = [
  { name: "lag_1",       value: 0.28 },
  { name: "lag_7",       value: 0.21 },
  { name: "lag_14",      value: 0.14 },
  { name: "hari_kerja",  value: 0.10 },
  { name: "bulan",       value: 0.09 },
  { name: "lag_3",       value: 0.07 },
  { name: "rolling_7",   value: 0.06 },
  { name: "rolling_14",  value: 0.05 },
];

export const learningCurve = {
  labels: Array.from({ length: 20 }, (_, i) => `Iter ${i + 1}`),
  train: [0.75,0.61,0.50,0.41,0.34,0.29,0.25,0.22,0.19,0.17,0.16,0.15,0.14,0.13,0.12,0.12,0.11,0.11,0.10,0.10],
  val:   [0.80,0.65,0.53,0.44,0.37,0.32,0.28,0.24,0.22,0.20,0.18,0.17,0.16,0.15,0.15,0.14,0.14,0.13,0.13,0.12],
};

export const xgbParams = [
  { key: "n_estimators", val: "300"  },
  { key: "max_depth",    val: "6"    },
  { key: "learning_rate",val: "0.05" },
  { key: "subsample",    val: "0.8"  },
  { key: "colsample",    val: "0.8"  },
  { key: "reg_alpha",    val: "0.1"  },
  { key: "reg_lambda",   val: "1.0"  },
  { key: "Lag Features", val: "14"   },
];

// ─── Comparison Data ───────────────────────────────────────────────────
export const comparisonTable = [
  { period: "Jan 2024", actual: 8234,  sarima: 8156,  apeSarima: 0.94, xgb: 8189,  apeXgb: 0.54 },
  { period: "Feb 2024", actual: 8567,  sarima: 8612,  apeSarima: 0.52, xgb: 8534,  apeXgb: 0.38 },
  { period: "Mar 2024", actual: 9123,  sarima: 9087,  apeSarima: 0.39, xgb: 9108,  apeXgb: 0.16 },
  { period: "Apr 2024", actual: 8956,  sarima: 9012,  apeSarima: 0.62, xgb: 8921,  apeXgb: 0.39 },
  { period: "Mei 2024", actual: 9345,  sarima: 9289,  apeSarima: 0.59, xgb: 9367,  apeXgb: 0.23 },
  { period: "Jun 2024", actual: 9678,  sarima: 9634,  apeSarima: 0.45, xgb: 9701,  apeXgb: 0.23 },
  { period: "Jul 2024", actual: 10124, sarima: 10078, apeSarima: 0.45, xgb: 10145, apeXgb: 0.20 },
  { period: "Agu 2024", actual: 10580, sarima: 10498, apeSarima: 0.77, xgb: 10612, apeXgb: 0.30 },
];

export const comparisonMetrics = [
  { label: "MAPE (%)",  sarima: 2.34,  xgb: 1.87,  max: 4,   lowerBetter: true  },
  { label: "RMSE",      sarima: 156.78, xgb: 124.52, max: 200, lowerBetter: true  },
  { label: "MAE",       sarima: 98.45, xgb: 82.31, max: 130, lowerBetter: true  },
  { label: "R² (%)",    sarima: 98.47, xgb: 99.12, max: 100, lowerBetter: false },
];
