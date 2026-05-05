"use client";

import { useEffect, useState, useCallback } from "react";
import type { Entry, Restaurant } from "./types";

const ENTRIES_KEY = "driver:entries:v1";
const RESTAURANTS_KEY = "driver:restaurants:v1";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(readJSON<Entry[]>(ENTRIES_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeJSON(ENTRIES_KEY, entries);
  }, [entries, hydrated]);

  const add = useCallback((entry: Omit<Entry, "id">) => {
    setEntries((prev) => [...prev, { ...entry, id: crypto.randomUUID() }]);
  }, []);

  const update = useCallback((id: string, patch: Partial<Entry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, add, update, remove, hydrated };
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRestaurants(readJSON<Restaurant[]>(RESTAURANTS_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeJSON(RESTAURANTS_KEY, restaurants);
  }, [restaurants, hydrated]);

  const add = useCallback((r: Omit<Restaurant, "id" | "createdAt">) => {
    setRestaurants((prev) => [
      ...prev,
      { ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { restaurants, add, remove, hydrated };
}
