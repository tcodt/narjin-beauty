import { useState, useMemo, useCallback } from "react";
import {
  LuQrCode,
  LuCopy,
  LuCheck,
  LuDownload,
  LuRefreshCw,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";
import { ThemeColorName } from "../../context/ThemeColor";
import { themeBgSoft, themeText } from "../../utils/themeClasses";

interface SalonQrCardProps {
  code?: string | null;
  name?: string | null;
  themeColor: ThemeColorName;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

export const SalonQrCard: React.FC<SalonQrCardProps> = ({
  code,
  name,
  themeColor,
  defaultExpanded = false,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const qrSrc = useMemo(() => {
    if (!code) return "";
    const params = new URLSearchParams({
      size: "300x300",
      data: code,
      format: "png",
      margin: "10",
      bgcolor: "ffffff",
    });
    return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
  }, [code]);

  const handleToggle = useCallback(() => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  }, [isExpanded, onToggle]);

  const handleCopyCode = useCallback(async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [code]);

  const handleDownloadQR = useCallback(async () => {
    if (!qrSrc) return;
    setIsDownloading(true);
    try {
      const response = await fetch(qrSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-${code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [qrSrc, code]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCopyCode();
      }
    },
    [handleCopyCode],
  );

  const handleToggleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
  );

  if (!code) return null;

  return (
    <div
      className={`col-span-full rounded-2xl border border-gray-200 transition-all duration-300 dark:border-gray-700 ${themeBgSoft[themeColor]} ${
        isExpanded ? "p-4 shadow-md sm:p-6" : "p-3 shadow-sm hover:shadow-md"
      }`}
      role="region"
      aria-label="Salon QR Code Card"
    >
      {/* Header - Always Visible */}
      <div
        className={`flex cursor-pointer items-center justify-between gap-4 ${
          isExpanded ? "mb-4" : ""
        }`}
        onClick={handleToggle}
        onKeyDown={handleToggleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls="qr-content"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <LuQrCode
            className={`${themeText[themeColor]} shrink-0`}
            size={isExpanded ? 20 : 18}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p
                className={`font-semibold text-gray-800 dark:text-white ${
                  isExpanded ? "text-sm" : "text-xs"
                }`}
              >
                کد و QR سالن
              </p>
              {name && (
                <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                  - {name}
                </span>
              )}
            </div>
            {!isExpanded && (
              <p
                className="truncate text-xs font-mono text-gray-600 dark:text-gray-300"
                dir="ltr"
              >
                {code}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Quick Copy Button in Header */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyCode();
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              handleKeyDown(e);
            }}
            className={`rounded-lg p-1.5 transition-all hover:bg-white/50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeText[themeColor]}`}
            aria-label={copied ? "Code copied!" : "Copy code to clipboard"}
            title="Copy code"
            tabIndex={0}
          >
            {copied ? (
              <LuCheck className="text-green-500" size={16} />
            ) : (
              <LuCopy size={16} />
            )}
          </button>

          {/* Toggle Icon */}
          <div className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-700/50">
            {isExpanded ? (
              <LuChevronUp size={18} />
            ) : (
              <LuChevronDown size={18} />
            )}
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div
        id="qr-content"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!isExpanded}
      >
        <div className="flex flex-col items-center gap-6 pt-2 sm:flex-row sm:items-stretch">
          {/* Content Section */}
          <div className="flex flex-1 flex-col justify-between gap-3 text-center sm:text-right">
            <div className="space-y-2">
              <div
                className="group flex items-center justify-center gap-2 sm:justify-start"
                dir="ltr"
              >
                <p
                  className={`text-xl font-mono font-bold tracking-widest ${themeText[themeColor]}`}
                  aria-label={`Salon code: ${code}`}
                >
                  {code}
                </p>
              </div>

              <p className="max-w-xs text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                مشتری با اسکن QR یا وارد کردن این کد به سالن شما وصل می‌شود.
              </p>
            </div>
          </div>

          {/* QR Image Section */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="relative">
              <img
                src={qrSrc}
                alt={`QR Code for salon ${name || code}`}
                width={160}
                height={160}
                className={`rounded-2xl border-2 border-white bg-white p-2 shadow-sm transition-opacity dark:border-gray-600 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
              />

              {/* Loading State */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-500" />
                </div>
              )}

              {/* Error State */}
              {imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gray-50 p-2 text-center dark:bg-gray-800">
                  <LuRefreshCw className="mb-1 text-gray-400" size={24} />
                  <span className="text-xs text-gray-500">خطا در بارگذاری</span>
                </div>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadQR}
              disabled={isDownloading || imageError}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                imageError
                  ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700"
                  : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-sm dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
              aria-label="Download QR code"
              title="Download QR code"
            >
              {isDownloading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                  <span>در حال دانلود...</span>
                </>
              ) : (
                <>
                  <LuDownload size={14} />
                  <span>دانلود QR</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
