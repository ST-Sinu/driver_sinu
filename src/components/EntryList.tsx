"use client";

import type { Entry } from "@/lib/types";
import { JOB_COLORS } from "@/lib/types";

type Props = {
  entries: Entry[];
  onRemove?: (id: string) => void;
};

export default function EntryList({ entries, onRemove }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-400">아직 기록이 없어요.</p>
    );
  }

  const sorted = [...entries].sort((a, b) => {
    return (a.startAt || "99:99").localeCompare(b.startAt || "99:99");
  });

  return (
    <ul className="space-y-2">
      {sorted.map((e) => (
        <li
          key={e.id}
          className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
        >
          <div className="flex items-baseline justify-between">
            <span className="flex items-center gap-2 font-medium">
              <span
                className={`h-2 w-2 rounded-full ${JOB_COLORS[e.type]}`}
              />
              {e.type}
            </span>
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
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(e.id)}
              className="mt-2 text-xs text-neutral-400 hover:text-rose-500"
            >
              삭제
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
