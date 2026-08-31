import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";

/**
 * Persian (or any) DateObject → Gregorian YYYY-MM-DD for API.
 * Uses calendar convert (NOT toDate()) to avoid timezone day-shift.
 */
export function toGregorianISO(dateObj: DateObject | null | undefined): string {
  if (!dateObj) {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  }

  try {
    const g = new DateObject(dateObj).convert(gregorian);
    const y = g.year;
    const m = String(g.month.number).padStart(2, "0");
    const d = String(g.day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  } catch {
    const js = dateObj.toDate();
    return `${js.getFullYear()}-${String(js.getMonth() + 1).padStart(2, "0")}-${String(
      js.getDate(),
    ).padStart(2, "0")}`;
  }
}

/** Gregorian YYYY-MM-DD → Persian label e.g. 1404/06/04 */
export function toPersianLabel(iso?: string | null): string {
  if (!iso) return "—";
  try {
    const parts = iso.split("-").map(Number);
    const [y, m, d] = parts;
    if (!y || !m || !d) return iso;

    const g = new DateObject({
      calendar: gregorian,
      year: y,
      month: m,
      day: d,
    });
    return g.convert(persian).setLocale(persian_fa).format("YYYY/MM/DD");
  } catch {
    return iso;
  }
}

export function formatTime(t?: string | null): string {
  if (!t) return "—";
  return String(t).slice(0, 5);
}

export function normalizeTime(t: string): string {
  const parts = String(t)
    .split(":")
    .map((p) => p.padStart(2, "0"));
  if (parts.length === 2) return `${parts[0]}:${parts[1]}:00`;
  if (parts.length >= 3) return `${parts[0]}:${parts[1]}:${parts[2]}`;
  return t;
}

export function todayPersian(): DateObject {
  return new DateObject({ calendar: persian, locale: persian_fa });
}
