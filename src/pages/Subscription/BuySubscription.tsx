import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuCheck,
  LuCopy,
  LuCheckCheck,
  LuUpload,
  LuX,
  LuFileImage,
  LuCircleAlert,
  LuCircleCheck,
  LuClock,
  LuArrowLeft,
  LuArrowRight,
  LuShieldCheck,
  LuCreditCard,
} from "react-icons/lu";

import {
  usePlans,
  useCreateOrder,
  useUploadReceipt,
  useSubscriptionStatus,
} from "../../hooks/subscription/useSubscription";
import Loading from "../../components/Loading/Loading";
import PageTitle from "../../components/PageTitle/PageTitle";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import {
  themeBgSolid,
  themeText,
  themeBorder,
  themeBgSoft,
} from "../../utils/themeClasses";
import type {
  Plan,
  Subscription,
  SubscriptionOrder,
} from "../../types/subscription";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/* -------------------------------------------------------------------------- */
/* Copy-to-clipboard                                                          */
/* -------------------------------------------------------------------------- */

const useCopy = (timeout = 1500) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), timeout);
    } catch {
      toast.error("کپی نشد");
    }
  };

  return { copied, copy };
};

/* -------------------------------------------------------------------------- */
/* Steps                                                                      */
/* -------------------------------------------------------------------------- */

const Steps: React.FC<{ current: 1 | 2; themeColor: ThemeColorName }> = ({
  current,
  themeColor,
}) => {
  const items = [
    { n: 1 as const, label: "انتخاب پلن" },
    { n: 2 as const, label: "پرداخت و فیش" },
  ];

  return (
    <ol
      className="flex items-center justify-center gap-2 sm:gap-4"
      aria-label="مراحل خرید"
    >
      {items.map((item, i) => {
        const active = current === item.n;
        const done = current > item.n;
        return (
          <React.Fragment key={item.n}>
            <li className="flex items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                  active
                    ? `text-white ${themeBgSolid[themeColor]}`
                    : done
                      ? `${themeBgSoft[themeColor]} ${themeText[themeColor]}`
                      : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                }`}
              >
                {done ? <LuCheck size={12} strokeWidth={3} /> : item.n}
              </span>
              <span
                className={`text-xs font-medium sm:text-sm ${
                  active
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </li>
            {i < items.length - 1 && (
              <li
                aria-hidden
                className="h-px w-6 bg-gray-200 sm:w-10 dark:bg-gray-700"
              />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
};

/* -------------------------------------------------------------------------- */
/* Plan card                                                                  */
/* -------------------------------------------------------------------------- */

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
  themeColor: ThemeColorName;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  selected,
  onSelect,
  themeColor,
}) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={`group flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-4 text-right transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none ${
      selected
        ? `${themeBorder[themeColor]} bg-white ring-2 ring-offset-2 dark:bg-gray-900`
        : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
    }`}
  >
    <div className="flex items-center gap-3">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          selected
            ? `border-transparent text-white ${themeBgSolid[themeColor]}`
            : "border-gray-300 dark:border-gray-600"
        }`}
        aria-hidden
      >
        {selected && <LuCheck size={12} strokeWidth={3} />}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
          {plan.title}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {plan.duration_days} روز اعتبار
        </p>
      </div>
    </div>
    <span className="shrink-0 text-sm font-bold tabular-nums text-gray-900 dark:text-white">
      {plan.price === 0
        ? "رایگان"
        : `${plan.price.toLocaleString("fa-IR")} تومان`}
    </span>
  </button>
);

/* -------------------------------------------------------------------------- */
/* Copy field                                                                 */
/* -------------------------------------------------------------------------- */

const CopyField: React.FC<{
  label: string;
  value: string;
  copyKey: string;
  mono?: boolean;
  ltr?: boolean;
}> = ({ label, value, copyKey, mono, ltr }) => {
  const { copied, copy } = useCopy();
  const isCopied = copied === copyKey;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5 ring-1 ring-gray-100 dark:bg-gray-800/60 dark:ring-gray-700">
      <div className="min-w-0">
        <p className="textarea-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p
          className={`truncate text-sm font-semibold text-gray-900 dark:text-white ${
            mono ? "font-mono tracking-wider" : ""
          }`}
          dir={ltr ? "ltr" : undefined}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => copy(value, copyKey)}
        aria-label={isCopied ? "کپی شد" : `کپی ${label}`}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:bg-gray-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:hover:bg-gray-700 ${
          isCopied
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {isCopied ? <LuCheckCheck size={16} /> : <LuCopy size={16} />}
      </button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Upload zone                                                                */
/* -------------------------------------------------------------------------- */

const UploadZone: React.FC<{
  file: File | null;
  preview: string | null;
  onFile: (f: File) => void;
  onClear: () => void;
}> = ({ file, preview, onFile, onClear }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (f: File): boolean => {
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`حجم فایل نباید بیشتر از ${MAX_SIZE_MB} مگابایت باشد`);
      return false;
    }
    if (!(ACCEPTED_TYPES as readonly string[]).includes(f.type)) {
      setError("فقط فایل JPG، PNG یا WEBP");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (validate(f)) onFile(f);
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div>
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          aria-label="آپلود فیش"
          className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            dragOver
              ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/20"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-gray-500"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition group-hover:scale-105 dark:bg-gray-800 dark:ring-gray-700">
            <LuUpload size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              آپلود تصویر فیش
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              کلیک کنید یا فایل را اینجا رها کنید
            </p>
            <p className="mt-2 textarea-xs text-gray-400">
              JPG · PNG · WEBP — حداکثر {MAX_SIZE_MB} مگابایت
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3 border-b border-gray-100 p-3 dark:border-gray-700">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <LuFileImage size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatSize(file.size)} · آماده ارسال
              </p>
            </div>
            <button
              type="button"
              onClick={onClear}
              aria-label="حذف فایل"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:hover:bg-rose-900/30"
            >
              <LuX size={16} />
            </button>
          </div>
          {preview && (
            <div className="bg-gray-50 p-3 dark:bg-gray-900/40">
              <img
                src={preview}
                alt="پیش‌نمایش فیش"
                className="mx-auto max-h-56 rounded-lg object-contain shadow-sm"
              />
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
          >
            <LuCircleAlert size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Pending / awaiting_review                                                  */
/* -------------------------------------------------------------------------- */

const PendingState: React.FC<{
  status?: Subscription | null;
  onBack: () => void;
  themeColor: ThemeColorName;
}> = ({ onBack, themeColor }) => (
  <motion.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full mx-auto w-full max-w-lg"
    role="status"
    aria-live="polite"
  >
    <div className="overflow-hidden rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50 to-white p-6 text-center shadow-sm dark:border-amber-800 dark:from-amber-900/20 dark:to-gray-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-4 ring-amber-50 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-900/30">
        <LuClock size={24} />
      </div>
      <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
        در انتظار تأیید پرداخت
      </h2>
      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
        فیش شما دریافت شده و پس از بررسی ادمین، دسترسی پلن فعال می‌شود. معمولاً
        این فرآیند کمتر از ۲۴ ساعت طول می‌کشد.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onBack}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none ${themeBgSolid[themeColor]}`}
        >
          بازگشت به پنل
          <LuArrowLeft size={14} />
        </button>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          بازگشت به داشبورد
        </Link>
      </div>
    </div>
  </motion.section>
);

/* -------------------------------------------------------------------------- */
/* Success                                                                    */
/* -------------------------------------------------------------------------- */

const SuccessState: React.FC<{
  onBack: () => void;
  themeColor: ThemeColorName;
}> = ({ onBack, themeColor }) => (
  <motion.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mx-auto w-full max-w-lg"
    role="status"
    aria-live="polite"
  >
    <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-6 text-center shadow-sm dark:border-emerald-800 dark:from-emerald-900/20 dark:to-gray-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-400 dark:ring-emerald-900/30">
        <LuCircleCheck size={26} />
      </div>
      <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
        فیش با موفقیت ارسال شد
      </h2>
      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
        وضعیت سفارش به «در انتظار بررسی» تغییر کرد. پس از تأیید ادمین، امکانات
        پلن فعال می‌شود.
      </p>
      <button
        type="button"
        onClick={onBack}
        className={`mt-5 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none ${themeBgSolid[themeColor]}`}
      >
        بازگشت به پنل
        <LuArrowLeft size={14} />
      </button>
    </div>
  </motion.section>
);

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isWaitingForReview = (status?: Subscription | null): boolean => {
  if (!status?.status) return false;
  const s = status.status.toLowerCase();
  return s === "pending" || s === "awaiting_review";
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const BuySubscription: React.FC = () => {
  const navigate = useNavigate();
  const { themeColor } = useThemeColor();
  const { data: plans = [], isPending: plansLoading } = usePlans();
  const { data: status, isLoading: statusLoading } = useSubscriptionStatus();
  const createOrderMutation = useCreateOrder();
  const uploadReceiptMutation = useUploadReceipt();

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [order, setOrder] = useState<SubscriptionOrder | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("selected_plan_id");
    if (saved) {
      const id = Number(saved);
      if (!Number.isNaN(id)) setSelectedPlanId(id);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId),
    [plans, selectedPlanId],
  );

  const handleSelect = (id: number) => setSelectedPlanId(id);

  const handleCreateOrder = () => {
    if (!selectedPlanId) {
      toast.error("لطفاً یک پلن انتخاب کنید");
      return;
    }
    createOrderMutation.mutate(
      { plan_id: selectedPlanId },
      {
        onSuccess: (data) => {
          setOrder(data);
          sessionStorage.removeItem("selected_plan_id");
          toast.success("سفارش ایجاد شد");
        },
      },
    );
  };

  const handleFile = (file: File) => {
    if (preview) URL.revokeObjectURL(preview);
    setReceiptFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleClearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setReceiptFile(null);
    setPreview(null);
  };

  const handleUpload = () => {
    if (!order || !receiptFile) {
      toast.error("فیش را انتخاب کنید");
      return;
    }
    uploadReceiptMutation.mutate(
      { orderId: order.id, file: receiptFile },
      {
        onSuccess: (data) => {
          setOrder(data);
          setSubmitted(true);
          setTimeout(() => navigate("/dashboard"), 3000);
        },
      },
    );
  };

  if (plansLoading || statusLoading) return <Loading />;

  /* سفارش قبلی در انتظار بررسی */
  if (!submitted && isWaitingForReview(status) && !order) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
        <PageTitle title="خرید / تمدید اشتراک" />
        <PendingState
          status={status}
          onBack={() => navigate("/dashboard")}
          themeColor={themeColor}
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
        <PageTitle title="خرید / تمدید اشتراک" />
        <SuccessState
          onBack={() => navigate("/dashboard")}
          themeColor={themeColor}
        />
      </div>
    );
  }

  const step: 1 | 2 = order ? 2 : 1;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <PageTitle title="خرید / تمدید اشتراک" />
      <Steps current={step} themeColor={themeColor} />

      <AnimatePresence mode="wait">
        {!order ? (
          /* ===================== STEP 1 ===================== */
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                پلن مورد نظر را انتخاب کنید
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                با انتخاب پلن، اطلاعات واریز نمایش داده می‌شود.
              </p>
            </div>

            {plans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500 dark:border-gray-600">
                پلنی برای نمایش وجود ندارد.
              </div>
            ) : (
              <div className="space-y-2">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    selected={selectedPlanId === plan.id}
                    onSelect={() => handleSelect(plan.id)}
                    themeColor={themeColor}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={!selectedPlanId || createOrderMutation.isPending}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:opacity-50 ${themeBgSolid[themeColor]}`}
            >
              {createOrderMutation.isPending ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  در حال ایجاد سفارش...
                </>
              ) : (
                <>
                  ادامه به پرداخت
                  <LuArrowLeft size={16} />
                </>
              )}
            </button>
          </motion.div>
        ) : (
          /* ===================== STEP 2 ===================== */
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="min-w-0">
                <p className="textarea-xs font-medium text-gray-500">
                  پلن انتخابی
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-gray-900 dark:text-white">
                  {selectedPlan?.title ?? order.plan?.title ?? "پلن"}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {(selectedPlan?.duration_days ?? order.plan?.duration_days) !=
                  null
                    ? `${selectedPlan?.duration_days ?? order.plan?.duration_days} روز اعتبار`
                    : null}
                </p>
              </div>
              <div className="text-left">
                <p className="textarea-xs font-medium text-gray-500">
                  مبلغ قابل پرداخت
                </p>
                <p
                  className={`mt-0.5 text-lg font-extrabold tabular-nums ${themeText[themeColor]}`}
                >
                  {order.amount.toLocaleString("fa-IR")}{" "}
                  <span className="text-xs font-medium text-gray-400">
                    تومان
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-3 flex items-center gap-2">
                <LuCreditCard size={16} className={themeText[themeColor]} />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  اطلاعات واریز
                </h3>
              </div>

              <div className="space-y-2">
                {order.card_number ? (
                  <CopyField
                    label="شماره کارت"
                    value={order.card_number}
                    copyKey="card"
                    mono
                    ltr
                  />
                ) : (
                  <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-800/40">
                    شماره کارت در پاسخ سرور نبود. در صورت نیاز با پشتیبانی تماس
                    بگیرید.
                  </p>
                )}

                <CopyField
                  label="کد پیگیری"
                  value={order.tracking_code}
                  copyKey="tracking"
                  mono
                  ltr
                />
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-800 ring-1 ring-blue-100 dark:bg-blue-900/20 dark:text-blue-200 dark:ring-blue-800/40">
                <LuShieldCheck size={14} className="mt-0.5 shrink-0" />
                <span>
                  مبلغ را دقیقاً معادل{" "}
                  <strong className="font-bold">
                    {order.amount.toLocaleString("fa-IR")} تومان
                  </strong>{" "}
                  واریز کنید. در توضیحات تراکنش، کد پیگیری{" "}
                  <strong className="font-mono">{order.tracking_code}</strong>{" "}
                  را درج کنید.
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  آپلود فیش واریزی
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  تصویر واضح فیش را آپلود کنید. مبلغ و تاریخ باید قابل خواندن
                  باشد.
                </p>
              </div>
              <UploadZone
                file={receiptFile}
                preview={preview}
                onFile={handleFile}
                onClear={handleClearFile}
              />
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={!receiptFile || uploadReceiptMutation.isPending}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:opacity-50 ${themeBgSolid[themeColor]}`}
            >
              {uploadReceiptMutation.isPending ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  در حال ارسال...
                </>
              ) : (
                <>
                  ارسال فیش برای بررسی
                  <LuArrowLeft size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setOrder(null);
                handleClearFile();
              }}
              className="mx-auto flex items-center gap-1 text-xs font-medium text-gray-500 transition hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:hover:text-gray-300"
            >
              <LuArrowRight size={12} />
              بازگشت به انتخاب پلن
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuySubscription;
