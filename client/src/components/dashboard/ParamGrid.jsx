export default function ParamGrid({ params }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {params.map((p) => (
        <div
          key={p.key}
          className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-600"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{p.key}</p>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{p.val}</p>
        </div>
      ))}
    </div>
  );
}
