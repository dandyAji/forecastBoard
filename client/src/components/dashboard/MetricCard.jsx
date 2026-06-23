const colorMap = {
  blue:   { value: "text-blue-600 dark:text-blue-400",   border: "border-blue-100 dark:border-slate-700"   },
  pink:   { value: "text-pink-600 dark:text-pink-400",   border: "border-pink-100 dark:border-slate-700"   },
  purple: { value: "text-purple-600 dark:text-purple-400", border: "border-purple-100 dark:border-slate-700" },
  cyan:   { value: "text-cyan-600 dark:text-cyan-400",   border: "border-cyan-100 dark:border-slate-700"   },
  green:  { value: "text-green-600 dark:text-green-400", border: "border-green-100 dark:border-slate-700"   },
  orange: { value: "text-orange-500 dark:text-orange-400", border: "border-orange-100 dark:border-slate-700" },
  amber:  { value: "text-amber-600 dark:text-amber-400", border: "border-amber-100 dark:border-slate-700"  },
};

export default function MetricCard({ label, value, sub, color = "blue" }) {
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <div className={`p-5 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border ${c.border} shadow-sm`}>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${c.value}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}
