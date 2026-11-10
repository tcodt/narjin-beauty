export interface WeeklyWorkingHour {
  id: number;
  weekday: number; // 0=دوشنبه ... 4=جمعه, 5=شنبه, 6=یکشنبه (طبق PDF)
  weekday_display: string;
  is_open: boolean;
  opening_time: string | null; // HH:MM
  closing_time: string | null;
}

export interface SpecialDay {
  id: number;
  day: string; // YYYY-MM-DD
  opening_time: string;
  closing_time: string;
}

export interface Holiday {
  id: number;
  date: string; // YYYY-MM-DD
  title: string;
}

/** پاسخ عمومی سالن */
export interface PublicWorkingHoursResponse {
  weekly: WeeklyWorkingHour[];
  special_days: SpecialDay[];
  holidays: Holiday[];
}

/** قدیمی — فقط برای سازگاری موقت */
export interface WorkTimeType {
  id: number;
  day: string;
  opening_time: string;
  closing_time: string;
}

export type WorkTimePromise = WorkTimeType[] | PublicWorkingHoursResponse;

export interface WorkingTimePost {
  day: string;
  opening_time: string;
  closing_time: string;
}

/** Owner panel — weekly */
export interface WeeklyUpsertItem {
  weekday: number;
  is_open: boolean;
  opening_time?: string | null;
  closing_time?: string | null;
}
