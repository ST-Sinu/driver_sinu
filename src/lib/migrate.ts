"use client";

import { supabase, entryToInsert, restaurantToInsert } from "./supabase";
import type { Entry, Restaurant } from "./types";

const ENTRIES_KEY = "driver:entries:v1";
const RESTAURANTS_KEY = "driver:restaurants:v1";
const MIGRATED_KEY = "driver:migrated:v1";

export function getLocalCounts(): { entries: number; restaurants: number } {
  if (typeof window === "undefined") return { entries: 0, restaurants: 0 };
  if (localStorage.getItem(MIGRATED_KEY)) return { entries: 0, restaurants: 0 };
  try {
    const e = JSON.parse(localStorage.getItem(ENTRIES_KEY) ?? "[]") as Entry[];
    const r = JSON.parse(
      localStorage.getItem(RESTAURANTS_KEY) ?? "[]"
    ) as Restaurant[];
    return { entries: e.length, restaurants: r.length };
  } catch {
    return { entries: 0, restaurants: 0 };
  }
}

export async function migrateLocalToSupabase(userId: string): Promise<{
  entries: number;
  restaurants: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let entriesMigrated = 0;
  let restaurantsMigrated = 0;

  try {
    const localEntries = JSON.parse(
      localStorage.getItem(ENTRIES_KEY) ?? "[]"
    ) as Entry[];
    if (localEntries.length > 0) {
      const rows = localEntries.map(({ id: _id, ...e }) =>
        entryToInsert(e, userId)
      );
      const { error } = await supabase.from("entries").insert(rows);
      if (error) errors.push(`기록: ${error.message}`);
      else entriesMigrated = rows.length;
    }

    const localRestaurants = JSON.parse(
      localStorage.getItem(RESTAURANTS_KEY) ?? "[]"
    ) as Restaurant[];
    if (localRestaurants.length > 0) {
      const rows = localRestaurants.map(({ id: _id, createdAt: _c, ...r }) =>
        restaurantToInsert(r, userId)
      );
      const { error } = await supabase.from("restaurants").insert(rows);
      if (error) errors.push(`맛집: ${error.message}`);
      else restaurantsMigrated = rows.length;
    }

    if (errors.length === 0) {
      localStorage.setItem(MIGRATED_KEY, new Date().toISOString());
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "알 수 없는 오류");
  }

  return { entries: entriesMigrated, restaurants: restaurantsMigrated, errors };
}
