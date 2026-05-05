"use client";

import { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import { useEntries } from "@/lib/storage";
import { JOB_TYPES, JOB_COLORS, type JobType } from "@/lib/types";
import { dateKey } from "@/lib/date";

type Preset = "today" | "7d" | "30d" | "month" | "custom";

export default function StatsPage() {
  const { entries } = useEntries();
  const today = new Date();

  const [preset, setPreset] = useState<Preset>("month");
  const [from, setFrom] = useState(dateKey(startOfMonth(today)));
  const [to, setTo] = useState(dateKey(endOfMonth(today)));

  const applyPreset = (p: Preset) => {
    setPreset(p);
    const t = new Date();
    if (p === "today") {
      const k = dateKey(t);
      setFrom(k);
      setTo(k);
    } else if (p === "7d") {
      setFrom(dateKey(subDays(t, 6)));
      setTo(dateKey(t));
    } else if (p === "30d") {
      setFrom(dateKey(subDays(t, 29)));
      setTo(dateKey(t));
    } else if (p === "month") {
      setFrom(dateKey(startOfMonth(t)));
      setTo(dateKey(endOfMonth(t)));
    }
  };

  const filtered = useMemo(
    () => entries.filter((e) => e.date >= from && e.date <= to),
    [entries, from, to]
  );

  const totalIncome = filtered
    .filter((e) => e.amount > 0)
    .reduce((s, e) => s + e.amount, 0);
  const totalExpense = filtered
    .filter((e) => e.amount < 0)
    .reduce((s, e) => s + Math.abs(e.amount), 0);

  const byType = useMemo(() => {
    const map = new Map<JobType, { income: number; expense: number; count: number }>();
    for (const t of JOB_TYPES) {
      map.set(t, { income: 0, expense: 0, count: 0 });
    }
    for (const e of filtered) {
      const cur = map.get(e.type)!;
      if (e.amount > 0) cur.income += e.amount;
      else cur.expense += Math.abs(e.amount);
      cur.count += 1;
    }
    return map;
  }, [filtered]);

  const days = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const e of filtered) {
      const cur = map.get(e.date) ?? { income: 0, expense: 0 };
      if (e.amount > 0) cur.income += e.amount;
      else cur.expense += Math.abs(e.amount);
      map.set(e.date, cur);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <header>
        <h1 className="text-2xl font-bold">통계</h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["today", "오늘"],
            ["7d", "최근 7일"],
            ["30d", "최근 30일"],
            ["month", "이번 달"],
            ["custom", "직접 설정"],
          ] as [Preset, string][]
        ).map(([p, label]) => (
          <button
            key={p}
            onClick={() => applyPreset(p)}
            className={`rounded-full border px-3 py-1 text-xs ${
              preset === p
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs text-neutral-500">시작</span>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPreset("custom");
            }}
            className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
          />
        </label>
        <label className="block">
          <span className="text-xs text-neutral-500">종료</span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPreset("custom");
            }}
            className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
          />
        </label>
      </div>

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40">
          <div className="text-xs text-neutral-500">수입</div>
          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
            +{totalIncome.toLocaleString()}원
          </div>
        </div>
        <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-950/40">
          <div className="text-xs text-neutral-500">지출</div>
          <div className="font-semibold text-rose-600 dark:text-rose-400">
            -{totalExpense.toLocaleString()}원
          </div>
        </div>
        <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-900">
          <div className="text-xs text-neutral-500">순이익</div>
          <div className="font-semibold">
            {(totalIncome - totalExpense).toLocaleString()}원
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-500">잡별 합계</h2>
        <ul className="space-y-1.5">
          {JOB_TYPES.map((t) => {
            const data = byType.get(t)!;
            const net = data.income - data.expense;
            if (data.count === 0) return null;
            return (
              <li
                key={t}
                className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${JOB_COLORS[t]}`} />
                  {t}
                  <span className="text-xs text-neutral-400">
                    ({data.count}건)
                  </span>
                </span>
                <span
                  className={
                    net >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }
                >
                  {net >= 0 ? "+" : ""}
                  {net.toLocaleString()}원
                </span>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="text-xs text-neutral-400">기간 내 기록이 없어요.</li>
          )}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-500">날짜별</h2>
        <ul className="space-y-1.5">
          {days.map(([date, d]) => {
            const net = d.income - d.expense;
            return (
              <li
                key={date}
                className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
              >
                <span>{format(new Date(date), "M/d")}</span>
                <span className="flex items-center gap-3 text-xs">
                  {d.income > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{d.income.toLocaleString()}
                    </span>
                  )}
                  {d.expense > 0 && (
                    <span className="text-rose-600 dark:text-rose-400">
                      -{d.expense.toLocaleString()}
                    </span>
                  )}
                  <span className="font-medium">
                    {net.toLocaleString()}원
                  </span>
                </span>
              </li>
            );
          })}
          {days.length === 0 && (
            <li className="text-xs text-neutral-400">기간 내 기록이 없어요.</li>
          )}
        </ul>
      </section>
    </main>
  );
}
