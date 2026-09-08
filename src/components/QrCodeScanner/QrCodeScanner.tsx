import React, { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { LuCamera, LuImage, LuX } from "react-icons/lu";
import toast from "react-hot-toast";

type QrCodeScannerProps = {
  open: boolean;
  onClose: () => void;
  onDetected: (value: string) => void;
  title?: string;
};

/**
 * Customer QR join:
 * - Live camera scan
 * - Upload QR image from gallery
 */
const QrCodeScanner: React.FC<QrCodeScannerProps> = ({
  open,
  onClose,
  onDetected,
  title = "اسکن کد سالن",
}) => {
  const regionId = useId().replace(/:/g, "");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [mode, setMode] = useState<"camera" | "file">("camera");
  const [starting, setStarting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handledRef = useRef(false);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      await scanner.clear();
    } catch {
      /* ignore stop errors */
    }
    setScanning(false);
  };

  const handleResult = async (raw: string) => {
    if (handledRef.current) return;
    const value = raw.trim();
    if (!value) return;
    handledRef.current = true;
    await stopScanner();
    onDetected(value);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    handledRef.current = false;

    if (mode !== "camera") {
      void stopScanner();
      return;
    }

    let cancelled = false;

    const start = async () => {
      setStarting(true);
      try {
        await stopScanner();
        const scanner = new Html5Qrcode(regionId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 8,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1,
          },
          (decoded) => {
            void handleResult(decoded);
          },
          () => {
            /* ignore frame errors */
          },
        );

        if (!cancelled) setScanning(true);
      } catch (err) {
        console.error(err);
        toast.error(
          "دسترسی به دوربین ممکن نشد. از بارگذاری تصویر استفاده کنید.",
        );
        if (!cancelled) setMode("file");
      } finally {
        if (!cancelled) setStarting(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      void stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, regionId]);

  useEffect(() => {
    if (!open) {
      handledRef.current = false;
      void stopScanner();
    }
  }, [open]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      await stopScanner();
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;
      const decoded = await scanner.scanFile(file, true);
      await handleResult(decoded);
    } catch (err) {
      console.error(err);
      toast.error("QR معتبری در تصویر پیدا نشد");
      try {
        await scannerRef.current?.clear();
      } catch {
        /* ignore */
      }
      scannerRef.current = null;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        className="absolute inset-0"
        onClick={() => {
          void stopScanner();
          onClose();
        }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => {
              void stopScanner();
              onClose();
            }}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="بستن"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="flex gap-2 border-b border-gray-100 p-3 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setMode("camera")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === "camera"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <LuCamera size={16} />
            دوربین
          </button>
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === "file"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <LuImage size={16} />
            از گالری
          </button>
        </div>

        <div className="space-y-3 p-4">
          {/* Always mount region for html5-qrcode */}
          <div
            id={regionId}
            className={`overflow-hidden rounded-xl bg-black ${
              mode === "camera" ? "min-h-[280px]" : "hidden"
            }`}
          />

          {mode === "camera" && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              {starting
                ? "در حال روشن کردن دوربین..."
                : scanning
                  ? "کد QR سالن را داخل کادر قرار دهید"
                  : "در انتظار دوربین..."}
            </p>
          )}

          {mode === "file" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-sm font-medium text-gray-600 transition hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                <LuImage size={28} />
                انتخاب تصویر QR از گالری
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onFileChange}
              />
              <p className="text-center text-xs text-gray-500">
                می‌توانید اسکرین‌شات QR سالن را هم آپلود کنید.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrCodeScanner;