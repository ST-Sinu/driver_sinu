import { createClient } from "@supabase/supabase-js";
import type { Entry, Restaurant } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ── DB row 타입 (snake_case, 서버 그대로) ──────────────────────────
export type EntryRow = {
  id: string;
  user_id: string;
  date: string;
  type: Entry["type"];
  start_at: string;
  end_at: string;
  amount: number;
  memo: string;
  from_address: string | null;
  from_lat: number | null;
  from_lng: number | null;
  to_address: string | null;
  to_lat: number | null;
  to_lng: number | null;
  created_at: string;
};

export type RestaurantRow = {
  id: string;
  user_id: string;
  name: string;
  address: string;
  region: string;
  category: string;
  price_range: Restaurant["priceRange"];
  rating: number;
  memo: string;
  lat: number | null;
  lng: number | null;
  is_public: boolean;
  created_at: string;
};

// ── snake_case ↔ camelCase 매핑 ────────────────────────────────────
export const entryFromRow = (r: EntryRow): Entry => ({
  id: r.id,
  date: r.date,
  type: r.type,
  startAt: r.start_at,
  endAt: r.end_at,
  amount: r.amount,
  memo: r.memo,
  fromAddress: r.from_address ?? undefined,
  fromLat: r.from_lat ?? undefined,
  fromLng: r.from_lng ?? undefined,
  toAddress: r.to_address ?? undefined,
  toLat: r.to_lat ?? undefined,
  toLng: r.to_lng ?? undefined,
});

export const entryToInsert = (
  e: Omit<Entry, "id">,
  userId: string
): Omit<EntryRow, "id" | "created_at"> => ({
  user_id: userId,
  date: e.date,
  type: e.type,
  start_at: e.startAt,
  end_at: e.endAt,
  amount: e.amount,
  memo: e.memo,
  from_address: e.fromAddress ?? null,
  from_lat: e.fromLat ?? null,
  from_lng: e.fromLng ?? null,
  to_address: e.toAddress ?? null,
  to_lat: e.toLat ?? null,
  to_lng: e.toLng ?? null,
});

export const restaurantFromRow = (r: RestaurantRow): Restaurant => ({
  id: r.id,
  name: r.name,
  address: r.address,
  region: r.region,
  category: r.category,
  priceRange: r.price_range,
  rating: r.rating,
  memo: r.memo,
  lat: r.lat ?? undefined,
  lng: r.lng ?? undefined,
  createdAt: r.created_at,
});

export const restaurantToInsert = (
  r: Omit<Restaurant, "id" | "createdAt">,
  userId: string
): Omit<RestaurantRow, "id" | "created_at"> => ({
  user_id: userId,
  name: r.name,
  address: r.address,
  region: r.region,
  category: r.category,
  price_range: r.priceRange,
  rating: r.rating,
  memo: r.memo,
  lat: r.lat ?? null,
  lng: r.lng ?? null,
  is_public: false,
});
