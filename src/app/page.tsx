"use client";

import { useState } from "react";

type JobType = "본업" | "평일알바" | "주말알바" | "대리" | "지출";

type Entry = {
  id: string;
  type: JobType;
  startAt: string;
  endAt: string;
  amount: number;
  memo: string;
  fromAddress?: string;
  toAddress?: string;
};

const JOB_TYPES: JobType[] = ["본업", "평일알바", "주말알바", "대리", "지출"];

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [type, setType] = useState<JobType>("대리");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");

  const isDaerie = type === "대리";
  const isExpense = type === "지출";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount.replace(/,/g, ""));
    if (!numAmount || isNaN(numAmount)) return;
    setEntries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        startAt,
        endAt,
        amount: isExpense ? -Math.abs(numAmount) : Math.abs(numAmount),
        memo,
        fromAddress: isDaerie ? fromAddress : undefined,
        toAddress: isDaerie ? toAddress : undefined,
      },
    ]);
    setAmount("");
    setMemo("");
    setFromAddress("");
    setToAddress("");
  };

  const totalIncome = entries
    .filter((e) => e.amount > 0)
    .reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries
    .filter((e) => e.amount < 0)
    .reduce((s, e) => s + Math.abs(e.amount), 0);

  return (
    <main className="mx-auto max-w-md space-y-6 p-4">
      <header>
        <h1 className="text-2xl font-bold">오늘의 기록</h1>
        <p className="text-sm text-neutral-500">
          {new Date().toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
          })}
        </p>
      </header>

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

      <form
        onSubmit={submit}
        className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
      >
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                type === t
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs text-neutral-500">시작</span>
            <input
              type="time"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-700"
            />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-500">종료</span>
            <input
              type="time"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-700"
            />
          </label>
        </div>

        {isDaerie && (
          <div className="space-y-2">
            <input
              placeholder="출발지 (예: 하월곡 장위동 유성집)"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-700"
            />
            <input
              placeholder="도착지 (예: 갈매더샵나인힐스)"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-700"
            />
          </div>
        )}

        <input
          placeholder="금액 (원)"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-700"
        />

        <input
          placeholder="메모 (선택)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 dark:border-neutral-700"
        />

        <button
          type="submit"
          className="w-full rounded-md bg-black py-2 font-medium text-white dark:bg-white dark:text-black"
        >
          기록 추가
        </button>
      </form>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-500">
          기록 ({entries.length})
        </h2>
        {entries.length === 0 ? (
          <p className="text-sm text-neutral-400">
            아직 기록이 없어요. 위에서 추가해보세요.
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li
                key={e.id}
                className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">{e.type}</span>
                  <span
                    className={
                      e.amount > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }
                  >
                    {e.amount > 0 ? "+" : ""}
                    {e.amount.toLocaleString()}원
                  </span>
                </div>
                {(e.startAt || e.endAt) && (
                  <div className="text-xs text-neutral-500">
                    {e.startAt} {e.endAt && `- ${e.endAt}`}
                  </div>
                )}
                {e.fromAddress && (
                  <div className="mt-1 text-xs">
                    {e.fromAddress} → {e.toAddress}
                  </div>
                )}
                {e.memo && (
                  <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                    {e.memo}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
