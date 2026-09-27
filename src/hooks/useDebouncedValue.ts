import { useEffect, useState } from "react";

/**
 * مقدار را با تأخیر برمی‌گرداند تا با هر کلید زدن API/فیلتر سنگین نشود.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
