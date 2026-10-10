import React, { useState } from "react";
import {
  FaDownload,
  FaCopy,
  FaQrcode,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaStore,
} from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import toast from "react-hot-toast";

import PageTitle from "../../components/PageTitle/PageTitle";
import Button from "../../components/Button/Button";
import Dots from "../../components/Dots/Dots";
import { useBusinessMe } from "../../hooks/business/useBusinessMe";
import { useBookingQr } from "../../hooks/payments/useBookingQr";
import { useThemeColor } from "../../context/ThemeColor";
import {
  themeText,
  themeBgSoft,
  themeBgSolid,
  mediaUrl,
} from "../../utils/themeClasses";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const shortenUrl = (url: string, max = 42): string =>
  url.length <= max ? url : url.slice(0, max - 1) + "…";

/** Trigger a browser download for a data URL or remote URL. */
function triggerDownload(url: string, filename: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* -------------------------------------------------------------------------- */
/*                              Main component                                */
/* -------------------------------------------------------------------------- */

const BookingQr: React.FC = () => {
  const { themeColor } = useThemeColor();

  const {
    data: business,
    isLoading: businessLoading,
    isError: businessError,
    refetch: refetchBusiness,
    isFetching: businessFetching,
  } = useBusinessMe();

  const randomCode = (business?.random_code ?? "").trim();
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : undefined;

  const {
    data,
    isLoading: qrLoading,
    isError: qrError,
    refetch: refetchQr,
    isFetching: qrFetching,
  } = useBookingQr(randomCode || undefined, baseUrl);

  const isLoading = businessLoading || (!!randomCode && qrLoading);

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const logoSrc: string | null =
    (business as { logo?: string | null } | undefined)?.logo ?? null;

  const businessName = data?.business?.name || business?.name || "سالن شما";
  const code = data?.business?.random_code || randomCode;
  const bookingUrl = data?.booking_url ?? "";

  const copyLink = async () => {
    if (!bookingUrl) return;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      toast.success("لینک کپی شد");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("کپی ناموفق بود");
    }
  };

  const downloadQr = async () => {
    if (!data?.qr_image_base64) return;
    setDownloading(true);
    try {
      triggerDownload(data.qr_image_base64, `qr-${code || "salon"}.png`);
      toast.success("QR دانلود شد");
    } catch (err) {
      console.error(err);
      toast.error("دانلود ناموفق بود");
    } finally {
      setDownloading(false);
    }
  };

  /* ----------------------------- Guard states ------------------------------ */

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800/40 dark:bg-red-900/20">
          <FaExclamationTriangle
            className="mx-auto mb-3 text-red-500"
            size={24}
          />
          <p className="font-medium text-red-700 dark:text-red-300">
            خطا در دریافت اطلاعات سالن
          </p>
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
            لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید.
          </p>
          <button
            type="button"
            onClick={() => refetchBusiness()}
            disabled={businessFetching}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            <FaSyncAlt
              size={12}
              className={businessFetching ? "animate-spin" : ""}
            />
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  if (!randomCode) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200">
          <FaQrcode className="mx-auto mb-3" size={24} />
          <p className="font-medium">کد سالن یافت نشد</p>
          <p className="mt-1 text-sm">
            کد سالن (random_code) در پاسخ سرور وجود ندارد. با پشتیبانی تماس
            بگیرید.
          </p>
        </div>
      </div>
    );
  }

  if (qrError || !data) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800/40 dark:bg-red-900/20">
          <FaExclamationTriangle
            className="mx-auto mb-3 text-red-500"
            size={24}
          />
          <p className="font-medium text-red-700 dark:text-red-300">
            خطا در دریافت QR
          </p>
          <button
            type="button"
            onClick={() => refetchQr()}
            disabled={qrFetching}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            <FaSyncAlt size={12} className={qrFetching ? "animate-spin" : ""} />
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  /* --------------------------------- Render -------------------------------- */

  return (
    <div className="mx-auto max-w-md space-y-5 pb-24">
      <header>
        <PageTitle title="کد QR رزرو" />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          مشتریان با اسکن این کد وارد صفحه رزرو سالن شما می‌شوند.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Business header */}
        <div
          className={`flex items-center gap-3 px-4 py-3 ${themeBgSoft[themeColor]}`}
        >
          <div className="shrink-0">
            {logoSrc ? (
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                <img
                  src={mediaUrl(logoSrc)}
                  alt={businessName}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 dark:bg-white/10 ${themeText[themeColor]}`}
              >
                <FaStore size={18} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-gray-900 dark:text-white">
              {businessName}
            </p>
            <p
              className="truncate font-mono text-xs text-gray-500 dark:text-gray-400"
              dir="ltr"
            >
              {code}
            </p>
          </div>
        </div>

        {/* QR stage */}
        <div className="flex flex-col items-center gap-5 p-6">
          {data.qr_image_base64 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <img
                src={data.qr_image_base64}
                alt="کد QR رزرو"
                width={248}
                height={248}
                className="h-62 w-62 rounded-lg object-contain"
                draggable={false}
              />
            </div>
          ) : (
            <div className="flex h-68 w-68 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-600">
              <FaQrcode size={32} className="opacity-40" />
              <span>بدون تصویر QR</span>
            </div>
          )}

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            QR را روی میز پذیرش یا ویترین قرار دهید
          </p>

          {/* URL row */}
          <div className="w-full">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900/60">
              <span
                className="min-w-0 flex-1 truncate font-mono text-xs text-gray-600 dark:text-gray-300"
                dir="ltr"
                title={bookingUrl}
              >
                {shortenUrl(bookingUrl, 40)}
              </span>
              <button
                type="button"
                onClick={copyLink}
                aria-label="کپی لینک"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                  copied
                    ? `${themeBgSoft[themeColor]} ${themeText[themeColor]}`
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                }`}
              >
                {copied ? (
                  <FaCheckCircle size={14} />
                ) : (
                  <MdContentCopy size={14} />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid w-full grid-cols-2 gap-2">
            <Button type="button" variant="secondary" onClick={copyLink}>
              <span className="flex items-center justify-center gap-2">
                <FaCopy size={13} />
                کپی لینک
              </span>
            </Button>
            <button
              type="button"
              onClick={downloadQr}
              disabled={downloading || !data.qr_image_base64}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${themeBgSolid[themeColor]}`}
            >
              {downloading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  در حال دانلود...
                </>
              ) : (
                <>
                  <FaDownload size={13} />
                  دانلود QR
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <p className="mb-2 font-medium text-gray-800 dark:text-gray-100">
          نکات مهم
        </p>
        <ul className="space-y-1.5 text-xs leading-relaxed">
          <li>• اندازه‌ی چاپ پیشنهادی: حداقل ۵ × ۵ سانتی‌متر</li>
          <li>• فاصله‌ی سفید اطراف QR را در چاپ حفظ کنید</li>
          <li>• از چاپ روی سطوح براق خودداری کنید</li>
        </ul>
      </div>
    </div>
  );
};

export default BookingQr;
