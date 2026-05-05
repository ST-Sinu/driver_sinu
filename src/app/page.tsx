"use client";

import { useMemo } from "react";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import DailySummary from "@/components/DailySummary";
import RouteMap from "@/components/RouteMap";
import { useEntries } from "@/lib/storage";
import { todayKey, formatKoreanDate } from "@/lib/date";

export default function Home() {
  const today = todayKey();
  const { entries, add, remove } = useEntries();

  const todayEntries = useMemo(
    () => entries.filter((e) => e.date === today),
    [entries, today]
  );

  return (
    <main className="mx-auto max-w-md space-y-6 p-4">
      <header>
        <h1 className="text-2xl font-bold">오늘의 기록</h1>
        <p className="text-sm text-neutral-500">{formatKoreanDate(new Date())}</p>
      </header>

      <DailySummary entries={todayEntries} />

      <EntryForm date={today} onSubmit={add} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-500">오늘 동선</h2>
        <RouteMap entries={todayEntries} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-500">
          기록 ({todayEntries.length})
        </h2>
        <EntryList entries={todayEntries} onRemove={remove} />
      </section>
    </main>
  );
}
