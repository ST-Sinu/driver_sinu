"use client";

import { useEffect, useRef, useState } from "react";
import type { Entry } from "@/lib/types";

declare global {
  interface Window {
    kakao: any;
  }
}

type Props = {
  entries: Entry[]; // 대리 entries with addresses
};

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

export default function RouteMap({ entries }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string>("");

  const daerieEntries = entries.filter(
    (e) => e.type === "대리" && e.fromAddress && e.toAddress
  );

  useEffect(() => {
    if (!KAKAO_KEY) {
      setStatus("error");
      setErrorMsg("카카오맵 API 키가 설정되지 않았어요.");
      return;
    }

    const scriptId = "kakao-map-sdk";
    if (document.getElementById(scriptId)) {
      window.kakao?.maps?.load(() => setStatus("ready"));
      return;
    }
    setStatus("loading");
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => setStatus("ready"));
    };
    script.onerror = () => {
      setStatus("error");
      setErrorMsg("카카오맵 SDK 로드 실패. API 키 또는 도메인 등록을 확인하세요.");
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (status !== "ready" || !containerRef.current) return;
    const kakao = window.kakao;

    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978), // 서울 시청 default
      level: 7,
    });

    if (daerieEntries.length === 0) return;

    const geocoder = new kakao.maps.services.Geocoder();
    const bounds = new kakao.maps.LatLngBounds();

    const geocode = (address: string): Promise<{ lat: number; lng: number } | null> =>
      new Promise((resolve) => {
        geocoder.addressSearch(address, (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK && result[0]) {
            resolve({ lat: Number(result[0].y), lng: Number(result[0].x) });
          } else {
            // 주소 실패 시 키워드로 다시 시도
            const places = new kakao.maps.services.Places();
            places.keywordSearch(address, (res: any, st: any) => {
              if (st === kakao.maps.services.Status.OK && res[0]) {
                resolve({ lat: Number(res[0].y), lng: Number(res[0].x) });
              } else {
                resolve(null);
              }
            });
          }
        });
      });

    (async () => {
      for (const e of daerieEntries) {
        const from = await geocode(e.fromAddress!);
        const to = await geocode(e.toAddress!);
        if (!from || !to) continue;

        const fromPos = new kakao.maps.LatLng(from.lat, from.lng);
        const toPos = new kakao.maps.LatLng(to.lat, to.lng);

        new kakao.maps.Marker({
          map,
          position: fromPos,
          title: `출발: ${e.fromAddress}`,
        });
        new kakao.maps.Marker({
          map,
          position: toPos,
          title: `도착: ${e.toAddress}`,
        });

        new kakao.maps.Polyline({
          map,
          path: [fromPos, toPos],
          strokeWeight: 4,
          strokeColor: "#f59e0b",
          strokeOpacity: 0.8,
          strokeStyle: "solid",
        });

        bounds.extend(fromPos);
        bounds.extend(toPos);
      }
      if (!bounds.isEmpty()) {
        map.setBounds(bounds);
      }
    })();
  }, [status, daerieEntries]);

  if (status === "error") {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
        <div className="font-medium text-neutral-700 dark:text-neutral-300">
          🗺️ 지도 비활성화
        </div>
        <div className="mt-1 text-xs">{errorMsg}</div>
        <div className="mt-2 text-xs">
          <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-900">
            .env.local
          </code>
          에 <code>NEXT_PUBLIC_KAKAO_MAP_KEY</code>를 설정하면 활성화돼요.
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div ref={containerRef} className="h-full w-full" />
      {status !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 text-sm text-neutral-500 dark:bg-neutral-900">
          지도 불러오는 중…
        </div>
      )}
      {status === "ready" && daerieEntries.length === 0 && (
        <div className="pointer-events-none absolute left-2 top-2 rounded bg-white/90 px-2 py-1 text-xs text-neutral-500 dark:bg-black/80">
          이 날 대리 기록이 없어요
        </div>
      )}
    </div>
  );
}
