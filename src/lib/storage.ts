"use client";

import { useCallback, useEffect, useState } from "react";
import {
  supabase,
  entryFromRow,
  entryToInsert,
  restaurantFromRow,
  restaurantToInsert,
  type EntryRow,
  type RestaurantRow,
} from "./supabase";
import { useAuth } from "./auth";
import type { Entry, Restaurant } from "./types";

export function useEntries() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setEntries([]);
      setHydrated(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .order("date", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error("entries fetch", error);
        setEntries([]);
      } else {
        setEntries((data as EntryRow[]).map(entryFromRow));
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const add = useCallback(
    async (entry: Omit<Entry, "id">) => {
      if (!user) return;
      const insert = entryToInsert(entry, user.id);
      const { data, error } = await supabase
        .from("entries")
        .insert(insert)
        .select()
        .single();
      if (error) {
        console.error("entries insert", error);
        return;
      }
      setEntries((prev) => [entryFromRow(data as EntryRow), ...prev]);
    },
    [user]
  );

  const update = useCallback(async (id: string, patch: Partial<Entry>) => {
    const dbPatch: Record<string, unknown> = {};
    if (patch.date !== undefined) dbPatch.date = patch.date;
    if (patch.type !== undefined) dbPatch.type = patch.type;
    if (patch.startAt !== undefined) dbPatch.start_at = patch.startAt;
    if (patch.endAt !== undefined) dbPatch.end_at = patch.endAt;
    if (patch.amount !== undefined) dbPatch.amount = patch.amount;
    if (patch.memo !== undefined) dbPatch.memo = patch.memo;
    if (patch.fromAddress !== undefined) dbPatch.from_address = patch.fromAddress;
    if (patch.toAddress !== undefined) dbPatch.to_address = patch.toAddress;

    const { data, error } = await supabase
      .from("entries")
      .update(dbPatch)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("entries update", error);
      return;
    }
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? entryFromRow(data as EntryRow) : e))
    );
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) {
      console.error("entries delete", error);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, add, update, remove, hydrated };
}

export function useRestaurants() {
  const { user, loading: authLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRestaurants([]);
      setHydrated(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error("restaurants fetch", error);
        setRestaurants([]);
      } else {
        setRestaurants((data as RestaurantRow[]).map(restaurantFromRow));
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const add = useCallback(
    async (r: Omit<Restaurant, "id" | "createdAt">) => {
      if (!user) return;
      const insert = restaurantToInsert(r, user.id);
      const { data, error } = await supabase
        .from("restaurants")
        .insert(insert)
        .select()
        .single();
      if (error) {
        console.error("restaurants insert", error);
        return;
      }
      setRestaurants((prev) => [restaurantFromRow(data as RestaurantRow), ...prev]);
    },
    [user]
  );

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("restaurants").delete().eq("id", id);
    if (error) {
      console.error("restaurants delete", error);
      return;
    }
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { restaurants, add, remove, hydrated };
}
