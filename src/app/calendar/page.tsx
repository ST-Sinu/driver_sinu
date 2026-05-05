"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ko } from "date-fns/locale";
import { useEntries } from "@/lib/storage";
import { dateKey } from "@/lib/date";

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarPage() {
  const { entries } = useEntries();
  const [cursor, setCursor] = useState(() => new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const byDate = useMemo(() => {
    const map = new Map<string, { income: number; expense: number; count: number }>();
    for (const e of entries) {
      const cur = map.get(e.date) ?? { income: 0, expense: 0, count: 0 };
      if (e.amount > 0) cur.income += e.amount;
      else cur.expense += Math.abs(e.amount);
      cur.count += 1;
      map.set(e.date, cur);
    }
    return map;
  }, [entries]);

  const monthIncome = useMemo(
    () =>
      entries
        .filter((e) => e.date.startsWith(format(cursor, "yyyy-MM")))
        .reduce((s, e) => s + (e.amount > 0 ? e.amount : 0), 0),
    [entries, cursor]
  );
  const monthExpense = useMemo(
    () =>
      entries
        .filter((e) => e.date.startsWith(format(cursor, "yyyy-MM")))
        .reduce((s, e) => s + (e.amount < 0 ? Math.abs(e.amount) : 0), 0),
    [entries, cursor]
  );

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <header className="flex items-center justify-between">
        <button
          onClick={() => setCursor((c) => addMonths(c, -1))}
          className="rounded-md px-3 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          ←
        </button>
        <h1 className="text-lg font-bold">
          {format(cursor, "yyyy년 M월", { locale: ko })}
        </h1>
        <button
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="rounded-md px-3 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          →
        </button>
      </header>

      <section className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/40">
          <div className="text-neutral-500">월 수입</div>
          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
            +{monthIncome.toLocaleString()}원
          </div>
        </div>
        <div className="rounded-lg bg-rose-50 p-2 dark:bg-rose-950/40">
          <div className="text-neutral-500">월 지출</div>
          <div className="font-semibold text-rose-600 dark:text-rose-400">
            -{monthExpense.toLocaleString()}원
          </div>
        </div>
        <div className="rounded-lg bg-neutral-100 p-2 dark:bg-neutral-900">
          <div className="text-neutral-500">순이익</div>
          <div className="font-semibold">
            {(monthIncome - monthExpense).toLocaleString()}원
          </div>
        </div>
      </section>

      <div className="grid grid-cols-7 text-center text-xs text-neutral-500">
        {WEEK_LABELS.map((w, i) => (
          <div
            key={w}
            className={`py-1 ${
              i === 0 ? "text-rose-500" : i === 6 ? "text-blue-500" : ""
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = dateKey(day);
          const inMonth = isSameMonth(day, cursor);
          const today = isToday(day);
          const data = byDate.get(key);
          const dow = day.getDay();
          return (
            <Link
              key={key}
              href={`/day/${key}`}
              className={`flex aspect-square flex-col items-center justify-start rounded-md border p-1 text-xs transition ${
                today
                  ? "border-black dark:border-white"
                  : "border-neutral-200 dark:border-neutral-800"
              } ${inMonth ? "" : "opacity-30"} hover:bg-neutral-100 dark:hover:bg-neutral-900`}
            >
              <span
                className={`${
                  dow === 0
                    ? "text-rose-500"
                    : dow === 6
                    ? "text-blue-500"
                    : ""
                }`}
              >
                {format(day, "d")}
              </span>
              {data && (
                <div className="mt-auto w-full text-[10px] leading-tight">
                  {data.income > 0 && (
                    <div className="truncate text-emerald-600 dark:text-emerald-400">
                      +{Math.round(data.income / 1000)}k
                    </div>
                  )}
                  {data.expense > 0 && (
                    <div className="truncate text-rose-600 dark:text-rose-400">
                      -{Math.round(data.expense / 1000)}k
                    </div>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
