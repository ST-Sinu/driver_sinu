import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const todayKey = () => format(new Date(), "yyyy-MM-dd");

export const formatKoreanDate = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy년 M월 d일 (E)", { locale: ko });
};

export const formatShortDate = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "M월 d일", { locale: ko });
};

export const dateKey = (date: Date) => format(date, "yyyy-MM-dd");
