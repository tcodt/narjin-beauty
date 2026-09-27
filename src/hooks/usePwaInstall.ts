import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_DAYS = 7;

export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const days = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (days < DISMISS_DAYS) {
        setCanShow(false);
      } else {
        setCanShow(true);
      }
    } else {
      setCanShow(true);
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferred(null);
      setCanShow(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === "accepted") {
      setIsInstalled(true);
      setCanShow(false);
      return true;
    }
    return false;
  }, [deferred]);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setCanShow(false);
  }, []);

  const remindLater = useCallback(() => {
    // remind in 1 day
    localStorage.setItem(
      DISMISS_KEY,
      String(Date.now() - (DISMISS_DAYS - 1) * 24 * 60 * 60 * 1000),
    );
    setCanShow(false);
  }, []);

  return {
    canPrompt: Boolean(deferred) && canShow && !isInstalled,
    canShowBanner: canShow && !isInstalled,
    isInstalled,
    promptInstall,
    dismiss,
    remindLater,
    /** true when browser supports native install prompt */
    hasNativePrompt: Boolean(deferred),
  };
}
