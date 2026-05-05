import type { Entry } from "@/lib/types";

type Props = { entries: Entry[] };

export default function DailySummary({ entries }: Props) {
  const income = entries
    .filter((e) => e.amount > 0)
    .reduce((s, e) => s + e.amount, 0);
  const expense = entries
    .filter((e) => e.amount < 0)
    .reduce((s, e) => s + Math.abs(e.amount), 0);

  return (
    <section className="grid grid-cols-3 gap-2 text-center">
      <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40">
        <div className="text-xs text-neutral-500">수입</div>
        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
          +{income.toLocaleString()}원
        </div>
      </div>
      <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-950/40">
        <div className="text-xs text-neutral-500">지출</div>
        <div className="font-semibold text-rose-600 dark:text-rose-400">
          -{expense.toLocaleString()}원
        </div>
      </div>
      <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-900">
        <div className="text-xs text-neutral-500">순이익</div>
        <div className="font-semibold">
          {(income - expense).toLocaleString()}원
        </div>
      </div>
    </section>
  );
}
