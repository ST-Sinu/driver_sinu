"use client";

import { useState } from "react";
import { JOB_TYPES, type Entry, type JobType } from "@/lib/types";

type Props = {
  date: string; // YYYY-MM-DD
  onSubmit: (entry: Omit<Entry, "id">) => void;
};

export default function EntryForm({ date, onSubmit }: Props) {
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
    onSubmit({
      date,
      type,
      startAt,
      endAt,
      amount: isExpense ? -Math.abs(numAmount) : Math.abs(numAmount),
      memo,
      fromAddress: isDaerie ? fromAddress : undefined,
      toAddress: isDaerie ? toAddress : undefined,
    });
    setAmount("");
    setMemo("");
    setFromAddress("");
    setToAddress("");
  };

  return (
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
  );
}
