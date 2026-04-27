const COLORS: Record<string, string> = {
  confirmed:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  packed:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  shipped:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  delivered:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  cancelled:
    "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  pending:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function StatusPill({ status }: { status: string }) {
  const cls = COLORS[status] ?? COLORS["pending"];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${cls}`}
      data-testid={`pill-status-${status}`}
    >
      {status}
    </span>
  );
}
