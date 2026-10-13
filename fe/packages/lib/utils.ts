import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatVND(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "Miễn phí";
  const num = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(num) || num <= 0) return "Miễn phí";
  return `${num.toLocaleString("vi-VN")} ₫`;
}

export function formatCurrency(amount: number | string | null | undefined): string {
  return formatVND(amount);
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

