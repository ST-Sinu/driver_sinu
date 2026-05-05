"use client";

import { useMemo, useState } from "react";
import { useRestaurants, useEntries } from "@/lib/storage";
import type { Restaurant } from "@/lib/types";

const PRICE_RANGES: Restaurant["priceRange"][] = [
  "1만원 이하",
  "1-1.5만원",
  "1.5-2만원",
  "기타",
];

export default function RestaurantsPage() {
  const { restaurants, add, remove } = useRestaurants();
  const { entries } = useEntries();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("한식");
  const [priceRange, setPriceRange] =
    useState<Restaurant["priceRange"]>("1만원 이하");
  const [rating, setRating] = useState(4);
  const [memo, setMemo] = useState("");

  const [filterRegion, setFilterRegion] = useState<string>("전체");
  const [filterPrice, setFilterPrice] = useState<string>("전체");

  // 사용자가 다녀본 지역 자동 추출 (대리 도착지 메모용)
  const visitedRegions = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      if (e.toAddress) {
        // 도착지 첫 토큰을 동/구로 가정
        const region = e.toAddress.split(/\s+/)[0];
        if (region) set.add(region);
      }
    }
    return [...set];
  }, [entries]);

  const regions = useMemo(() => {
    const set = new Set<string>(restaurants.map((r) => r.region).filter(Boolean));
    return ["전체", ...set];
  }, [restaurants]);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (filterRegion !== "전체" && r.region !== filterRegion) return false;
      if (filterPrice !== "전체" && r.priceRange !== filterPrice) return false;
      return true;
    });
  }, [restaurants, filterRegion, filterPrice]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    add({
      name: name.trim(),
      address: address.trim(),
      region: region.trim(),
      category,
      priceRange,
      rating,
      memo,
    });
    setName("");
    setAddress("");
    setRegion("");
    setMemo("");
  };

  return (
    <main className="mx-auto max-w-md space-y-6 p-4">
      <header>
        <h1 className="text-2xl font-bold">가성비 맛집</h1>
        <p className="text-xs text-neutral-500">
          대리 다니다 발견한 맛집을 메모해두세요.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="space-y-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
      >
        <input
          placeholder="가게 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
        />
        <input
          placeholder="주소 (예: 성북구 장위동 123)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
        />
        <div className="flex gap-2">
          <input
            placeholder="지역 (예: 장위동)"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="flex-1 rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
            list="visited-regions"
          />
          <datalist id="visited-regions">
            {visitedRegions.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
          <input
            placeholder="종류"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-24 rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={priceRange}
            onChange={(e) =>
              setPriceRange(e.target.value as Restaurant["priceRange"])
            }
            className="flex-1 rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
          >
            {PRICE_RANGES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-24 rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                ★ {n}
              </option>
            ))}
          </select>
        </div>
        <input
          placeholder="메모 (대표 메뉴, 영업시간 등)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-sm dark:border-neutral-700"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-black py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          맛집 추가
        </button>
      </form>

      <div className="flex gap-2 overflow-x-auto">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setFilterRegion(r)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
              filterRegion === r
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {["전체", ...PRICE_RANGES].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPrice(p)}
            className={`rounded-full border px-3 py-1 text-xs ${
              filterPrice === p
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.length === 0 ? (
          <li className="text-sm text-neutral-400">
            {restaurants.length === 0
              ? "아직 등록된 맛집이 없어요."
              : "필터에 맞는 맛집이 없어요."}
          </li>
        ) : (
          filtered.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{r.name}</span>
                <span className="text-xs text-amber-500">
                  {"★".repeat(r.rating)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                {r.region && (
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-900">
                    {r.region}
                  </span>
                )}
                {r.category && (
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-900">
                    {r.category}
                  </span>
                )}
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  {r.priceRange}
                </span>
              </div>
              {r.address && (
                <div className="mt-1 text-xs text-neutral-500">{r.address}</div>
              )}
              {r.memo && (
                <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {r.memo}
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(r.id)}
                className="mt-2 text-xs text-neutral-400 hover:text-rose-500"
              >
                삭제
              </button>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
