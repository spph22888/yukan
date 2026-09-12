import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function finite(n: number, fallback = 0) {
  return Number.isFinite(n) ? n : fallback;
}

export function round(n: number, digits = 1) {
  const f = 10 ** digits;
  return Math.round(finite(n) * f) / f;
}

export function zhDate(d = new Date()) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function zhDateTime(d = new Date()) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${zhDate(d)} ${hh}:${mm}`;
}

export const LEVEL_ZH = {
  low: "低",
  "mid-low": "中低",
  mid: "中",
  "mid-high": "中高",
  high: "高",
} as const;

export const LEVEL_TONE = {
  low: "low",
  "mid-low": "low",
  mid: "mid",
  "mid-high": "high",
  high: "high",
} as const;
