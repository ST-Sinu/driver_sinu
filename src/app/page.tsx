"use client";

import { useEffect, useMemo, useState } from "react";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import DailySummary from "@/components/DailySummary";
import RouteMap from "@/components/RouteMap";
import { useEntries } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { todayKey, formatKoreanDate } from "@/lib/date";
import { getLocalCounts, migrateLocalToSupabase } from "@/lib/migrate";

export default function Home() {
  const today = todayKey();
  const { entries, add, remove } = useEntries();
  const { user, signOut } = useAuth();

  const [localCounts, setLocalCounts] = useState({ entries: 0, restaurants: 0 });
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState<string | null>(null);

  useEffect(() => {
    setLocalCounts(getLocalCounts());
  }, []);

  const todayEntries = useMemo(
    () => entries.filter((e) => e.date === today),
    [entries, today]
  );

  const totalLocal = localCounts.entries + localCounts.restaurants;

  const handleMigrate = async () => {
    if (!user) return;
    setMigrating(true);
    setMigrateMsg(null);
    const res = await migrateLocalToSupabase(user.id);
    setMigrating(false);
    if (res.errors.length === 0) {
      setMigrateMsg(
        `이전 완료: 기록 ${res.entries}건, 맛집 ${res.restaurants}건`
      );
      setLocalCounts({ entries: 0, restaurants: 0 });
    } else {
      setMigrateMsg(`오류: ${res.errors.join(", ")}`);
    }
  };

  return (
    <main className="mx-auto max-w-md space-y-6 p-4">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">오늘의 기록</h1>
          <p className="text-sm text-neutral-500">
            {formatKoreanDate(new Date())}
          </p>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          로그아웃
        </button>
      </header>

      {totalLocal > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-950/40">
          <p className="font-medium text-amber-800 dark:text-amber-300">
            이 기기에 저장된 이전 데이터가 있어요
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            기록 {localCounts.entries}건, 맛집 {localCounts.restaurants}건. 클라우드로 옮길까요?
          </p>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="mt-2 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {migrating ? "이전 중…" : "내 계정으로 이전"}
          </button>
          {migrateMsg && (
            <p className="mt-2 text-xs text-amber-800 dark:text-amber-300">
              {migrateMsg}
            </p>
          )}
        </div>
      )}

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
