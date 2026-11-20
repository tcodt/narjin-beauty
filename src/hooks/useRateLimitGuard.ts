import { useCallback, useEffect, useState } from "react";
import { getRetryAfterSeconds, isRateLimited } from "../utils/rateLimit";

/**
 * Tracks a client-side cooldown after HTTP 429.
 * Disable submit while `isLimited`; show `secondsLeft` in UI.
 */
export function useRateLimitGuard() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const triggerFromError = useCallback((error: unknown) => {
    if (!isRateLimited(error)) return false;
    const secs = getRetryAfterSeconds(error);
    setSecondsLeft(secs);
    return true;
  }, []);

  const clear = useCallback(() => setSecondsLeft(0), []);

  return {
    isLimited: secondsLeft > 0,
    secondsLeft,
    triggerFromError,
    clear,
  };
}
