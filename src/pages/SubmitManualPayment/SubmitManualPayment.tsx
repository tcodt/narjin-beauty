import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FaUpload,
  FaImage,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaStore,
} from "react-icons/fa";
import { MdContentCopy, MdCheckCircle } from "react-icons/md";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router";

import PageTitle from "../../components/PageTitle/PageTitle";
import Dots from "../../components/Dots/Dots";
import { useJoinedBusiness } from "../../context/JoinedBusinessContext";
import { useThemeColor } from "../../context/ThemeColor";
import {
  themeText,
  themeBgSoft,
  themeBgSolid,
  themeBorder,
  themeRing,
  themeBarFill,
} from "../../utils/themeClasses";
import { useSalonCards } from "../../hooks/payments/useCards";
import { useCreateManualPayment } from "../../hooks/payments/useCreateManualPayment";
import BankCard3D, {
  normalizeCardNumber,
} from "../../components/BankCard3D/BankCard3D";

/* -------------------------------------------------------------------------- */
/* Schema                                                                     */
/* -------------------------------------------------------------------------- */

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const schema = z.object({
  amount: z
    .string()
    .min(1, "مبلغ را وارد کنید")
    .refine(
      (v) => Number(v.replace(/,/g, "")) > 0,
      "مبلغ باید بزرگ‌تر از صفر باشد",
    ),
  tracking_code: z
    .string()
    .trim()
    .min(3, "کد پیگیری حداقل ۳ کاراکتر است")
    .max(50, "کد پیگیری حداکثر ۵۰ کاراکتر است"),
});

type FormValues = z.infer<typeof schema>;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function resolveSalonCode(
  joined: { random_code?: string; id?: number } | null,
): string {
  const fromCtx = (joined?.random_code ?? "").trim();
  if (fromCtx) return fromCtx;

  try {
    const raw = localStorage.getItem("joinedBusiness");
    if (!raw) return "";
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const code =
      (typeof parsed.random_code === "string" && parsed.random_code) ||
      (typeof parsed.business_code === "string" && parsed.business_code) ||
      (typeof parsed.code === "string" && parsed.code) ||
      "";
    return code.trim();
  } catch {
    return "";
  }
}

const formatAmount = (raw: string): string => {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

const SectionCard: React.FC<{
  step: number;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ step, title, subtitle, action, children }) => {
  const { themeColor } = useThemeColor();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <span
        aria-hidden
        className={`absolute inset-y-0 right-0 w-1 ${themeBarFill[themeColor]}`}
      />
      <header className="mb-4 flex items-start justify-between gap-3 pr-3">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${themeBgSolid[themeColor]}`}
          >
            {step}
          </span>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </h4>
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className="pr-3">{children}</div>
    </section>
  );
};

const IconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }
> = ({ label, className = "", children, ...rest }) => (
  <button
    type="button"
    aria-label={label}
    {...rest}
    className={`flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-gray-600 outline-none transition hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700 ${className}`}
  >
    {children}
  </button>
);

const SalonCardItem: React.FC<{
  num: string;
  nameBank?: string;
  holder?: string;
}> = ({ num, nameBank, holder }) => {
  const { themeColor } = useThemeColor();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(normalizeCardNumber(num));
      setCopied(true);
      toast.success("شماره کارت کپی شد");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("کپی ناموفق بود");
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900/40">
      <div className="min-w-0">
        <p
          dir="ltr"
          className="truncate font-mono text-sm font-semibold tracking-wide text-gray-900 dark:text-white"
        >
          {num}
        </p>
        {(nameBank || holder) && (
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {[nameBank, holder].filter(Boolean).join(" • ")}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label="کپی شماره کارت"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg outline-none transition ${
          copied
            ? themeBgSoft[themeColor]
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
        }`}
      >
        {copied ? (
          <MdCheckCircle size={16} className={themeText[themeColor]} />
        ) : (
          <MdContentCopy size={15} />
        )}
      </button>
    </div>
  );
};

interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  suffix?: React.ReactNode;
}

const ThemedInput = React.forwardRef<HTMLInputElement, ThemedInputProps>(
  ({ error, suffix, className = "", ...rest }, ref) => {
    const { themeColor } = useThemeColor();
    const base =
      "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500";
    const state = error
      ? "border-red-400 ring-2 ring-red-200 dark:ring-red-900/40"
      : `border-gray-200 dark:border-gray-600 focus:border-2 focus:ring-2 ${themeBorder[themeColor]} ${themeRing[themeColor]}`;

    return (
      <div className="relative">
        <input
          ref={ref}
          {...rest}
          aria-invalid={error || undefined}
          className={`${base} ${state} ${suffix ? "pr-14" : ""} ${className}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);
ThemedInput.displayName = "ThemedInput";

const ThemedButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }
> = ({ loading, children, className = "", disabled, ...rest }) => {
  const { themeColor } = useThemeColor();
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 ${themeBgSolid[themeColor]} ${className}`}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

const SubmitManualPayment: React.FC = () => {
  const { themeColor } = useThemeColor();
  const { joinedBusiness, isReady } = useJoinedBusiness();
  const randomCode = useMemo(
    () => resolveSalonCode(joinedBusiness),
    [joinedBusiness],
  );

  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointment");

  const {
    data: salonCardsData,
    isLoading: cardsLoading,
    isError: cardsError,
    error: cardsErrorObj,
    refetch: refetchCards,
    isFetching,
  } = useSalonCards(randomCode || undefined);

  // مهم: پاسخ { business, cards } است نه آرایه
  const visibleCards = useMemo(
    () => (salonCardsData?.cards ?? []).filter((c) => c.status !== false),
    [salonCardsData],
  );
  const salonName =
    salonCardsData?.business?.name || joinedBusiness?.name || null;

  const createMut = useCreateManualPayment();

  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { amount: "", tracking_code: "" },
  });

  const amountValue = watch("amount");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("amount", formatAmount(e.target.value), { shouldValidate: true });
  };

  const validateAndSetFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("حجم فایل حداکثر ۵ مگابایت");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onValid = (values: FormValues) => {
    if (!randomCode) {
      toast.error("سالن انتخاب نشده است");
      return;
    }
    if (!file) {
      toast.error("تصویر فیش را انتخاب کنید");
      return;
    }
    if (createMut.isPending) return;

    createMut.mutate(
      {
        business_code: randomCode,
        amount: Number(values.amount.replace(/,/g, "")),
        tracking_code: values.tracking_code.trim(),
        appointment: appointmentId ? Number(appointmentId) : null,
        receipt_image: file,
      },
      {
        onSuccess: () => {
          reset();
          clearFile();
        },
      },
    );
  };

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  if (!randomCode) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200">
          <FaExclamationTriangle className="mx-auto mb-3" size={22} />
          <p className="font-medium">کد سالن یافت نشد</p>
          <p className="mt-2 text-sm">
            از منو وارد سالن شوید (Join Salon) و دوباره این صفحه را باز کنید.
          </p>
        </div>
      </div>
    );
  }

  const isBusy = createMut.isPending || isSubmitting;

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-32 pt-4">
      <header>
        <PageTitle title="پرداخت کارت‌به‌کارت" />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          مبلغ را به یکی از کارت‌های زیر واریز کنید، سپس فیش را بارگذاری کنید.
        </p>
        {salonName && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${themeBgSoft[themeColor]} ${themeText[themeColor]}`}
          >
            <FaStore size={14} />
            <span className="font-medium">{salonName}</span>
            <span className="text-xs opacity-70" dir="ltr">
              · {randomCode}
            </span>
          </div>
        )}
      </header>

      <SectionCard
        step={1}
        title="کارت‌های سالن"
        subtitle={
          visibleCards.length > 0
            ? `${visibleCards.length.toLocaleString("fa-IR")} کارت فعال`
            : "یک کارت را انتخاب و شماره آن را کپی کنید"
        }
        action={
          <IconButton
            label="تازه‌سازی"
            onClick={() => refetchCards()}
            disabled={isFetching}
          >
            <FaSyncAlt size={12} className={isFetching ? "animate-spin" : ""} />
            تازه‌سازی
          </IconButton>
        }
      >
        {cardsLoading ? (
          <div className="flex justify-center py-8">
            <Dots />
          </div>
        ) : cardsError ? (
          <div className="space-y-3 rounded-xl bg-red-50 p-4 text-center dark:bg-red-900/20">
            <FaExclamationTriangle className="mx-auto text-red-500" size={20} />
            <p className="text-sm font-medium text-red-600">
              خطا در دریافت کارت‌ها
            </p>
            {(cardsErrorObj as Error)?.message && (
              <p className="break-all text-xs text-red-400" dir="ltr">
                {(cardsErrorObj as Error).message}
              </p>
            )}
            <button
              type="button"
              onClick={() => refetchCards()}
              className="text-sm font-medium text-red-700 underline"
            >
              تلاش مجدد
            </button>
          </div>
        ) : visibleCards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500 dark:border-gray-600">
            <p>کارتی برای این سالن یافت نشد.</p>
            <p className="mt-1 text-xs text-gray-400">
              با پشتیبانی سالن تماس بگیرید.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleCards.map((card) => (
              <div key={card.id} className="space-y-2">
                <BankCard3D
                  card={card}
                  showFlipHint={false}
                  className="mx-auto max-w-sm"
                />
                <div className="mx-auto max-w-sm">
                  <SalonCardItem
                    num={card.num_code}
                    nameBank={card.name_bank}
                    holder={card.card_holder_name}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <form onSubmit={handleSubmit(onValid)} className="space-y-5">
        <SectionCard
          step={2}
          title="اطلاعات پرداخت"
          subtitle="مبلغ و کد پیگیری را وارد کنید"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                مبلغ (تومان)
              </label>
              <ThemedInput
                id="amount"
                {...register("amount")}
                onChange={handleAmountChange}
                value={amountValue}
                inputMode="numeric"
                dir="ltr"
                autoComplete="off"
                placeholder="500,000"
                error={!!errors.amount}
                suffix="تومان"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="tracking_code"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                کد پیگیری
              </label>
              <ThemedInput
                id="tracking_code"
                {...register("tracking_code")}
                dir="ltr"
                autoComplete="off"
                placeholder="TRX-001"
                error={!!errors.tracking_code}
              />
              {errors.tracking_code && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.tracking_code.message}
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          step={3}
          title="تصویر فیش"
          subtitle="فرمت تصویر، حداکثر ۵ مگابایت"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />

          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <img
                src={preview}
                alt="پیش‌نمایش فیش"
                className="max-h-64 w-full bg-gray-50 object-contain dark:bg-gray-900"
              />
              <button
                type="button"
                onClick={clearFile}
                aria-label="حذف تصویر"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
              >
                <FaTimes size={12} />
              </button>
              {file && (
                <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800">
                  <FaImage size={12} />
                  <span className="truncate">{file.name}</span>
                  <span className="ml-auto shrink-0 text-gray-400">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileRef.current?.click();
                }
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 text-sm outline-none transition ${
                isDragging
                  ? `${themeBorder[themeColor]} ${themeBgSoft[themeColor]} ${themeText[themeColor]}`
                  : "border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-900/40"
              }`}
            >
              <FaUpload size={22} className={isDragging ? "" : "opacity-60"} />
              <span className="font-medium">انتخاب یا کشیدن تصویر</span>
              <span className="text-xs text-gray-400">
                PNG, JPG, WEBP — حداکثر ۵ مگابایت
              </span>
            </div>
          )}
        </SectionCard>

        <div className="sticky bottom-4 z-10">
          <div className="rounded-2xl border border-gray-100 bg-white/90 p-3 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-800/90">
            <ThemedButton type="submit" loading={isBusy}>
              {createMut.isPending ? (
                "در حال ارسال..."
              ) : (
                <>
                  <FaCheckCircle size={14} />
                  ثبت فیش
                </>
              )}
            </ThemedButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SubmitManualPayment;
