export interface WeeklyWorkingHour {
  id: number;
  weekday: number; // 0=دوشنبه ... 4=جمعه, 5=شنبه, 6=یکشنبه
  weekday_display: string;
  is_open: boolean;
  opening_time: string | null; // HH:MM
  closing_time: string | null;
}

export interface Holiday {
  id: number;
  date: string; // YYYY-MM-DD
  title: string;
}

export interface SpecialDay {
  id: number;
  day: string; // YYYY-MM-DD
  opening_time: string;
  closing_time: string;
}

/** پاسخ عمومی سالن (مشتری) */
export interface PublicWorkingHoursResponse {
  weekly: WeeklyWorkingHour[];
  special_days: SpecialDay[];
  holidays: Holiday[];
}

/** برای upsert هفتگی */
export interface WeeklyUpsertItem {
  weekday: number;
  is_open: boolean;
  opening_time?: string | null;
  closing_time?: string | null;
}

export type WeeklyUpsertPayload = WeeklyUpsertItem | WeeklyUpsertItem[];

/** نگاشت روزهای هفته (طبق PDF) */
export const WEEKDAY_MAP = [
  { value: 5, label: "شنبه" },
  { value: 6, label: "یکشنبه" },
  { value: 0, label: "دوشنبه" },
  { value: 1, label: "سه‌شنبه" },
  { value: 2, label: "چهارشنبه" },
  { value: 3, label: "پنجشنبه" },
  { value: 4, label: "جمعه" },
] as const;
