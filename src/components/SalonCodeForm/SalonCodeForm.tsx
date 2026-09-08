import React, { useState } from "react";
import {
  LuKeyRound,
  LuArrowRight,
  // LuLogOut,
  LuStore,
  LuCircleCheckBig,
  LuCircleAlert,
  LuScanLine,
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { useResolveBusiness } from "../../hooks/business/useResolveBusiness";
import { useJoinedBusiness } from "../../context/JoinedBusinessContext";
import { BusinessMeResponse } from "../../types/business";
import QrCodeScanner from "../QrCodeScanner/QrCodeScanner";

type SalonCodeFormProps = {
  title: string;
  description: string;
  submitLabel?: string;
  footer?: React.ReactNode;
  onBack?: () => void;
  /** Extra public exit (auth / home) */
  onExitPublic?: () => void;
  exitPublicLabel?: string;
  onSuccess: (business: BusinessMeResponse) => void;
  showCurrentSalon?: boolean;
};

const SalonCodeForm: React.FC<SalonCodeFormProps> = ({
  title,
  description,
  submitLabel = "اتصال به سالن",
  footer,
  onBack,
  onSuccess,
  showCurrentSalon = true,
  onExitPublic,
  // exitPublicLabel = "خروج به صفحه ورود",
}) => {
  const [code, setCode] = useState("");
  const resolveMutation = useResolveBusiness();
  const { setJoinedBusiness, joinedBusiness } = useJoinedBusiness();
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleSubmit = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("کد را وارد کنید");
      return;
    }

    resolveMutation.mutate(trimmed, {
      onSuccess: (business) => {
        if (!business?.id) {
          toast.error("آرایشگاهی با این کد یافت نشد.");
          return;
        }

        const safe: BusinessMeResponse = {
          ...business,
          name: business.name?.trim() || `سالن ${trimmed.toUpperCase()}`,
          random_code: business.random_code || trimmed.toUpperCase(),
        };

        setJoinedBusiness(safe);
        toast.success(`به «${safe.name}» متصل شدید`);
        onSuccess(safe);
      },
      onError: (error: unknown) => {
        console.error("resolve error", error);

        if (isAxiosError(error)) {
          const status = error.response?.status;
          const data = error.response?.data as
            | { detail?: string | string[]; message?: string }
            | undefined;

          if (status === 401) {
            toast.error("برای اتصال به سالن ابتدا وارد حساب کاربری شوید");
            return;
          }
          if (status === 403) {
            toast.error("دسترسی به این سالن مجاز نیست");
            return;
          }
          if (status === 404) {
            toast.error(
              typeof data?.detail === "string"
                ? data.detail
                : "آرایشگاهی با این کد یافت نشد.",
            );
            return;
          }
          if (status === 400) {
            const detail = data?.detail;
            toast.error(
              typeof detail === "string"
                ? detail
                : Array.isArray(detail)
                  ? String(detail[0])
                  : data?.message || "کد نامعتبر است",
            );
            return;
          }

          toast.error(
            typeof data?.detail === "string"
              ? data.detail
              : `خطای سرور (${status ?? "شبکه"})`,
          );
          return;
        }

        // Non-Axios errors that still carry .response (from resolveBusiness)
        const anyErr = error as {
          response?: { status?: number; data?: { detail?: string } };
          message?: string;
        };
        if (anyErr?.response?.data?.detail) {
          toast.error(String(anyErr.response.data.detail));
          return;
        }

        toast.error("خطا در اتصال به کسب‌وکار. دوباره تلاش کنید.");
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-2xl backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/80">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {(onBack || onExitPublic) && (
                <>
                  {onBack && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={onBack}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      <LuArrowRight size={18} />
                      بازگشت
                    </motion.button>
                  )}
                  {/* {onExitPublic && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={onExitPublic}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                      <LuLogOut size={16} />
                      {exitPublicLabel}
                    </motion.button>
                  )} */}
                </>
              )}
            </div>
            <span className="text-xs font-medium text-slate-400 dark:text-gray-500">
              کد سالن
            </span>
          </div>

          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 px-8 py-10 text-center dark:from-emerald-700 dark:to-emerald-800">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm"
            >
              <LuStore className="h-10 w-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative mt-5 text-2xl font-bold text-white"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative mt-2 text-sm leading-relaxed text-white/90"
            >
              {description}
            </motion.p>
          </div>

          {/* Form Section */}
          <div className="space-y-5 p-6" dir="rtl">
            {showCurrentSalon && joinedBusiness && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                <LuCircleCheckBig className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  سالن فعلی:{" "}
                  <span className="font-semibold">{joinedBusiness.name}</span>
                </span>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-200">
                کد کسب‌وکار
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  placeholder="مثلاً 225991"
                  maxLength={12}
                  inputMode="numeric"
                  autoComplete="off"
                  autoFocus
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 px-5 py-3.5 text-center text-lg font-bold uppercase tracking-widest text-slate-800 outline-none transition-all duration-200 placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10 focus:ring-4 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-emerald-400 dark:focus:bg-gray-700 dark:focus:shadow-emerald-400/10 dark:focus:ring-emerald-400/20"
                />

                <AnimatePresence>
                  {code.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <LuKeyRound className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              >
                <LuScanLine size={18} />
                اسکن QR کد سالن
              </button>

              <QrCodeScanner
                open={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onDetected={(value) => {
                  // فقط رقم‌ها اگر کد عددی است:
                  const cleaned = value.replace(/\D/g, "") || value.trim();
                  setCode(cleaned);
                  toast.success("کد از QR خوانده شد");
                }}
              />

              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400">
                <LuCircleAlert className="h-3.5 w-3.5" />
                این کد را از مدیر یا مالک سالن دریافت کنید.
              </p>
            </div>

            <motion.button
              whileHover={{
                scale: code.trim() && !resolveMutation.isPending ? 1.02 : 1,
              }}
              whileTap={{
                scale: code.trim() && !resolveMutation.isPending ? 0.98 : 1,
              }}
              type="button"
              onClick={handleSubmit}
              disabled={!code.trim() || resolveMutation.isPending}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:shadow-emerald-600/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none dark:from-emerald-700 dark:to-emerald-800 dark:shadow-emerald-700/25"
            >
              <span className="relative flex items-center justify-center gap-2">
                {resolveMutation.isPending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                    />
                    در حال بررسی...
                  </>
                ) : (
                  <>
                    <LuKeyRound className="h-5 w-5" />
                    {submitLabel}
                  </>
                )}
              </span>
            </motion.button>

            {footer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {footer}
              </motion.div>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400 dark:text-gray-600">
            با اتصال به سالن، تمام امکانات مدیریتی در اختیار شما قرار می‌گیرد.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SalonCodeForm;
