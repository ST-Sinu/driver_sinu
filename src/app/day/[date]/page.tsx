"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useEntries } from "@/lib/storage";
import { formatKoreanDate } from "@/lib/date";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import DailySummary from "@/components/DailySummary";
import RouteMap from "@/components/RouteMap";

export default function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const { entries, add, remove } = useEntries();

  const dayEntries = useMemo(
    () => entries.filter((e) => e.date === date),
    [entries, date]
  );

  return (
    <main className="mx-auto max-w-md space-y-6 p-4">
      <header className="flex items-center justify-between">
        <Link
          href="/calendar"
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← 달력
        </Link>
        <h1 className="text-base font-semibold">{formatKoreanDate(date)}</h1>
        <span className="w-12" />
      </header>

      <DailySummary entries={dayEntries} />

      <EntryForm date={date} onSubmit={add} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-500">동선</h2>
        <RouteMap entries={dayEntries} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-500">
          기록 ({dayEntries.length})
        </h2>
        <EntryList entries={dayEntries} onRemove={remove} />
      </section>
    </main>
  );
}
