export type JobType = "본업" | "평일알바" | "주말알바" | "대리" | "지출";

export const JOB_TYPES: JobType[] = [
  "본업",
  "평일알바",
  "주말알바",
  "대리",
  "지출",
];

export const JOB_COLORS: Record<JobType, string> = {
  본업: "bg-blue-500",
  평일알바: "bg-purple-500",
  주말알바: "bg-pink-500",
  대리: "bg-amber-500",
  지출: "bg-rose-500",
};

export type Entry = {
  id: string;
  date: string; // YYYY-MM-DD
  type: JobType;
  startAt: string; // HH:MM
  endAt: string;
  amount: number; // 양수=수입, 음수=지출
  memo: string;
  fromAddress?: string;
  fromLat?: number;
  fromLng?: number;
  toAddress?: string;
  toLat?: number;
  toLng?: number;
};

export type Restaurant = {
  id: string;
  name: string;
  address: string;
  region: string; // 자유 입력 (예: 장위동, 갈매동)
  category: string; // 한식/중식/분식 등
  priceRange: "1만원 이하" | "1-1.5만원" | "1.5-2만원" | "기타";
  rating: number; // 1-5
  memo: string;
  lat?: number;
  lng?: number;
  createdAt: string; // ISO
};
