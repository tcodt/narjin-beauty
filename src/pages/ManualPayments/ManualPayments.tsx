import React, { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaTimes,
  FaImage,
  FaClock,
  FaUser,
  FaPhoneAlt,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaReceipt,
  FaChevronLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import PageTitle from "../../components/PageTitle/PageTitle";
import Button from "../../components/Button/Button";
import CustomModal from "../../components/CustomModal/CustomModal";
import Dots from "../../components/Dots/Dots";
import {
  useManualPayments,
  useReviewManualPayment,
} from "../../hooks/payments/useManualPayments";
import { ManualPayment } from "../../types/payments";
import { mediaUrl } from "../../utils/themeClasses";
import { useThemeColor } from "../../context/ThemeColor";
import {
  themeText,
  themeBgSoft,
  themeBgSolid,
  themeRing,
} from "../../utils/themeClasses";

/* -------------------------------------------------------------------------- */
/*                              Status metadata                               */
/* -------------------------------------------------------------------------- */

type PaymentStatus = "pending" | "approved" | "rejected";

const STATUS_META: Record<
  PaymentStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "در انتظار",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    icon: <FaClock size={11} />,
  },
  approved: {
    label: "تأیید شده",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    icon: <FaCheckCircle size={11} />,
  },
  rejected: {
    label: "رد شده",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    icon: <FaTimesCircle size={11} />,
  },
};

const FILTERS: { key: PaymentStatus | "all"; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "pending", label: "در انتظار" },
  { key: "approved", label: "تأیید شده" },
  { key: "rejected", label: "رد شده" },
];

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const faNum = (n: number | string) => Number(n).toLocaleString("fa-IR");

const formatAmount = (n: number | string | null | undefined) =>
  `${faNum(Number(n ?? 0))} تومان`;

const formatDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

/* -------------------------------------------------------------------------- */
/*                              Payment card                                  */
/* -------------------------------------------------------------------------- */

interface PaymentCardProps {
  payment: ManualPayment;
  index: number;
  onApprove: (p: ManualPayment) => void;
  onReject: (p: ManualPayment) => void;
  onOpenImage: (url: string) => void;
  themeColor: string;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  payment: p,
  index,
  onApprove,
  onReject,
  onOpenImage,
  themeColor,
}) => {
  const st = STATUS_META[p.status as PaymentStatus] ?? STATUS_META.pending;
  const isPending = p.status === "pending";

  // Cap stagger so long lists don't feel sluggish
  const delay = Math.min(index * 0.04, 0.32);

  const receiptUrl = p.receipt_image ? mediaUrl(p.receipt_image) : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay, duration: 0.3 }}
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        {/* Left: Receipt thumbnail */}
        {receiptUrl && (
          <button
            type="button"
            onClick={() => onOpenImage(receiptUrl)}
            aria-label="مشاهده فیش"
            className={`group relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 outline-none sm:h-28 sm:w-28 dark:border-gray-700 dark:bg-gray-900 ${themeRing[themeColor as keyof typeof themeRing] ?? ""}`}
          >
            <img
              src={receiptUrl}
              alt="فیش پرداخت"
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
              <FaImage size={18} />
            </span>
          </button>
        )}

        {/* Right: Details */}
        <div className="min-w-0 flex-1">
          {/* Top row: status + amount + date */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.className}`}
                >
                  {st.icon}
                  {st.label}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDateTime(p.created_at)}
                </span>
              </div>

              <p className="mt-1.5 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                {formatAmount(p.amount)}
              </p>

              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                کد پیگیری:{" "}
                <span dir="ltr" className="font-mono font-medium">
                  {p.tracking_code}
                </span>
              </p>
            </div>
          </div>

          {/* Customer row */}
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1.5">
              <FaUser size={12} className="text-gray-400" />
              {p.customer_name}
            </span>
            <a
              href={`tel:${p.customer_phone}`}
              className="flex items-center gap-1.5 transition hover:text-gray-900 dark:hover:text-white"
              dir="ltr"
            >
              <FaPhoneAlt size={12} className="text-gray-400" />
              {p.customer_phone}
            </a>
          </div>

          {/* Owner note */}
          {p.owner_note ? (
            <p className="mt-2 rounded-xl bg-gray-50 p-2.5 text-xs leading-relaxed text-gray-600 dark:bg-gray-700/50 dark:text-gray-300">
              <span className="font-medium">یادداشت:</span> {p.owner_note}
            </p>
          ) : null}

          {/* Actions */}
          {isPending && (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => onApprove(p)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99]"
              >
                <FaCheck size={13} />
                تأیید
              </button>
              <button
                type="button"
                onClick={() => onReject(p)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.99] dark:border-red-800/40 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <FaTimes size={13} />
                رد
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Main component                                */
/* -------------------------------------------------------------------------- */

const ManualPayments: React.FC = () => {
  const {
    data: payments = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useManualPayments();

  const reviewMut = useReviewManualPayment();
  const { themeColor } = useThemeColor();

  const [filter, setFilter] = useState<PaymentStatus | "all">("all");
  const [selected, setSelected] = useState<ManualPayment | null>(null);
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Show error toast once, not on every render
  useEffect(() => {
    if (isError) {
      toast.error("خطا در دریافت فیش‌ها");
      console.error(error);
    }
  }, [isError, error]);

  /* ------------------------------- Derived ---------------------------------- */
  const counts = useMemo(() => {
    const base: Record<PaymentStatus | "all", number> = {
      all: payments.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    for (const p of payments) {
      const s = p.status as PaymentStatus;
      if (s in base) base[s] += 1;
    }
    return base;
  }, [payments]);

  const filtered = useMemo(() => {
    if (filter === "all") return payments;
    return payments.filter((p) => p.status === filter);
  }, [payments, filter]);

  /* ------------------------------- Handlers --------------------------------- */
  const openReview = (p: ManualPayment, act: "approved" | "rejected") => {
    setSelected(p);
    setAction(act);
    setNote("");
  };

  const closeReview = () => {
    setSelected(null);
    setAction(null);
    setNote("");
  };

  const submitReview = () => {
    if (!selected || !action) return;

    // For rejection, require a short reason
    if (action === "rejected" && note.trim().length < 3) {
      toast.error("برای رد، لطفاً دلیل را وارد کنید");
      return;
    }

    reviewMut.mutate(
      {
        id: selected.id,
        payload: { status: action, owner_note: note.trim() || undefined },
      },
      {
        onSuccess: () => {
          toast.success(action === "approved" ? "فیش تأیید شد" : "فیش رد شد");
          closeReview();
        },
        onError: () => {
          toast.error("عملیات ناموفق بود");
        },
      },
    );
  };

  /* ------------------------------- Loading ---------------------------------- */
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  /* -------------------------------- Error ----------------------------------- */
  if (isError) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800/40 dark:bg-red-900/20">
          <FaExclamationTriangle
            className="mx-auto mb-3 text-red-500"
            size={24}
          />
          <p className="font-medium text-red-700 dark:text-red-300">
            خطا در دریافت فیش‌ها
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            <FaSyncAlt size={12} className={isFetching ? "animate-spin" : ""} />
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------- Render ---------------------------------- */
  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-24">
      {/* Header */}
      <header>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <PageTitle title="فیش‌های پرداخت دستی" />
              {counts.all > 0 && (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {faNum(counts.all)}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              بررسی و تأیید فیش‌های کارت‌به‌کارت
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="تازه‌سازی"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-700"
          >
            <FaSyncAlt size={14} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Pending banner */}
        {counts.pending > 0 && filter !== "pending" && (
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`mt-3 flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${themeBgSoft[themeColor]} ${themeText[themeColor]}`}
          >
            <span className="flex items-center gap-2">
              <FaClock size={14} />
              {faNum(counts.pending)} فیش در انتظار بررسی
            </span>
            <FaChevronLeft size={11} />
          </button>
        )}
      </header>

      {/* Filters */}
      {counts.all > 0 && (
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const count = counts[f.key];
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? `${themeBgSolid[themeColor]} text-white shadow-sm`
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {f.label}
                <span
                  className={`mr-1.5 text-[10px] ${
                    active ? "text-white/80" : "text-gray-400"
                  }`}
                >
                  ({faNum(count)})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-600">
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              filter === "all" && counts.all === 0
                ? "bg-gray-100 dark:bg-gray-700"
                : `${themeBgSoft[themeColor]} ${themeText[themeColor]}`
            }`}
          >
            <FaReceipt
              size={26}
              className={
                filter === "all" && counts.all === 0 ? "text-gray-400" : ""
              }
            />
          </div>
          <p className="font-medium text-gray-700 dark:text-gray-200">
            {counts.all === 0
              ? "فیشی ثبت نشده است"
              : filter === "pending"
                ? "همه فیش‌ها بررسی شده‌اند 🎉"
                : "نتیجه‌ای یافت نشد"}
          </p>
          <p className="mt-1 max-w-xs px-4 text-sm text-gray-500 dark:text-gray-400">
            {counts.all === 0
              ? "زمانی که مشتریان فیش پرداخت را بارگذاری کنند اینجا نمایش داده می‌شود."
              : filter === "pending"
                ? "فیش جدیدی برای بررسی وجود ندارد."
                : "فیلتر دیگری را امتحان کنید."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <PaymentCard
                key={p.id}
                payment={p}
                index={i}
                onApprove={(x) => openReview(x, "approved")}
                onReject={(x) => openReview(x, "rejected")}
                onOpenImage={setImageUrl}
                themeColor={themeColor}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ---------------------- Review modal ---------------------- */}
      <CustomModal
        isOpen={!!selected && !!action}
        onClose={closeReview}
        title={action === "approved" ? "تأیید فیش" : "رد فیش"}
        size="sm"
      >
        {selected && (
          <div className="space-y-4">
            {/* Context block — so the reviewer doesn't have to re-check the card */}
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/40">
              <p className="text-xs text-gray-500">مبلغ</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatAmount(selected.amount)}
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <p className="text-[10px]">مشتری</p>
                  <p className="truncate font-medium text-gray-700 dark:text-gray-300">
                    {selected.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px]">کد پیگیری</p>
                  <p
                    className="truncate font-mono font-medium text-gray-700 dark:text-gray-300"
                    dir="ltr"
                  >
                    {selected.tracking_code}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning for reject */}
            {action === "rejected" && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
                <FaExclamationTriangle className="mt-0.5 shrink-0" size={12} />
                <p>
                  رد کردن فیش ممکن است باعث لغو رزرو مرتبط شود. دلیل را بنویسید
                  تا برای مشتری ارسال شود.
                </p>
              </div>
            )}

            {/* Note */}
            <div>
              <label
                htmlFor="owner-note"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {action === "rejected" ? (
                  <>
                    دلیل رد <span className="text-red-500">*</span>
                  </>
                ) : (
                  "یادداشت (اختیاری)"
                )}
              </label>
              <textarea
                id="owner-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={300}
                className={`w-full rounded-xl border bg-white text-gray-600 dark:text-gray-200 px-3 py-2 text-sm outline-none transition focus:ring-2 dark:bg-gray-900 ${
                  action === "rejected" && note.trim().length < 3
                    ? "border-red-400 focus:ring-red-200 dark:focus:ring-red-900/40"
                    : "border-gray-200 focus:ring-gray-200 dark:border-gray-600 dark:focus:ring-gray-700"
                }`}
                placeholder={
                  action === "rejected"
                    ? "مثلاً: مبلغ واریز شده با مبلغ فیش مطابقت ندارد"
                    : "توضیح اختیاری برای مشتری..."
                }
              />
              <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
                <span>
                  {action === "rejected"
                    ? "حداقل ۳ کاراکتر"
                    : "برای مشتری نمایش داده می‌شود"}
                </span>
                <span>{note.length}/300</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 pt-1">
              <Button type="button" variant="secondary" onClick={closeReview}>
                انصراف
              </Button>
              <button
                type="button"
                onClick={submitReview}
                disabled={
                  reviewMut.isPending ||
                  (action === "rejected" && note.trim().length < 3)
                }
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
                  action === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {reviewMut.isPending ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    در حال ارسال...
                  </>
                ) : action === "approved" ? (
                  <>
                    <FaCheck size={13} />
                    تأیید نهایی
                  </>
                ) : (
                  <>
                    <FaTimes size={13} />
                    رد فیش
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </CustomModal>

      {/* ---------------------- Image lightbox ---------------------- */}
      <CustomModal
        isOpen={!!imageUrl}
        onClose={() => setImageUrl(null)}
        title="فیش پرداخت"
      >
        {imageUrl && (
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="فیش پرداخت"
              className="max-h-[70vh] w-full rounded-xl border border-gray-100 object-contain dark:border-gray-700"
            />
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default ManualPayments;
