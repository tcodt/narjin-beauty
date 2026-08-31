import { getAvailableTimes } from "./getAvailableTimes";

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildDateRange(daysAhead: number): string[] {
  const out: string[] = [];
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(toISODate(d));
  }
  return out;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

export const getAvailableDatesForService = async (
  serviceId: number,
  daysAhead = 60,
): Promise<string[]> => {
  if (!serviceId || serviceId <= 0) return [];

  const range = buildDateRange(daysAhead);

  const flags = await mapPool(range, 6, async (date) => {
    try {
      const slots = await getAvailableTimes(date, serviceId);
      return slots.length > 0 ? date : null;
    } catch {
      return null;
    }
  });

  return flags.filter((d): d is string => typeof d === "string");
};
