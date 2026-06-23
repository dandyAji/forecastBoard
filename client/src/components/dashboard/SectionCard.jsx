export default function SectionCard({ title, badge, children, className = "" }) {
  return (
    <div className={`p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700 shadow-sm ${className}`}>
      {(title || badge) && (
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          {title && (
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          )}
          {badge && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
