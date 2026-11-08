import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { LuCircleCheck, LuCircleAlert, LuCreditCard } from "react-icons/lu";
import { HiArrowLeft } from "react-icons/hi";

import { ThemeColorName } from "../../context/ThemeColor";
import { themeText, themeBgSoft, themeBgSolid } from "../../utils/themeClasses";
import type { Subscription as ApiSubscription } from "../../types/subscription";

/* -------------------------------------------------------------------------- */
/* Types — سازگار با API + فیلدهای اختیاری بنر                                */
/* -------------------------------------------------------------------------- */

export type BannerSubscription = Partial<ApiSubscription> & {
  end_date?: string | null;
  is_active?: boolean;
  plan_name?: string | null;
};

type SubscriptionState =
  | "trial"
  | "trial_expiring"
  | "trial_expired"
  | "active"
  | "expired"
  | "pending"
  | "unknown";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const DAY_MS = 1000 * 60 * 60 * 24;

const daysUntil = (iso?: string | null): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : Math.ceil((t - Date.now()) / DAY_MS);
};

const formatFaDate = (iso?: string | null): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const deriveState = (
  sub: BannerSubscription | null | undefined,
): SubscriptionState => {
  if (!sub) return "unknown";

  const status = (sub.status ?? "").toLowerCase();

  if (status === "pending" || status === "awaiting_review") return "pending";
  if (status === "rejected") return "expired";

  const trialDays = daysUntil(sub.trial_end);
  const endDays = daysUntil(sub.end_date ?? sub.expires_at);

  const paid =
    status === "paid" || sub.active === true || sub.is_active === true;

  if (paid && (endDays === null || endDays > 0)) return "active";

  if (sub.trial_end) {
    if (trialDays === null) return "unknown";
    if (trialDays < 0) return "trial_expired";
    if (trialDays <= 3) return "trial_expiring";
    return "trial";
  }

  if (endDays !== null && endDays <= 0) return "expired";
  if (status === "expired") return "expired";

  return "unknown";
};

/* -------------------------------------------------------------------------- */
/* State → presentation                                                       */
/* -------------------------------------------------------------------------- */

interface View {
  Icon: React.ComponentType<{ size?: number }>;
  wrapper: string;
  iconWrap: string;
  title: string;
  body: React.ReactNode;
  cta: string | null;
  ctaTo: string;
  urgent: boolean;
}

const buildView = (sub: BannerSubscription, tc: ThemeColorName): View => {
  const state = deriveState(sub);
  const trialDays = daysUntil(sub.trial_end);
  const endDays = daysUntil(sub.end_date ?? sub.expires_at);
  const planName = sub.plan_name ?? sub.plan?.title ?? null;
  const tcIcon = `${themeBgSoft[tc]} ${themeText[tc]}`;
  const neutral =
    "border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800";

  const dateLine = (iso: string | null | undefined, tone: string) =>
    iso ? (
      <span className={`mt-1 block text-xs ${tone}`}>
        پایان دوره: {formatFaDate(iso)}
      </span>
    ) : null;

  switch (state) {
    case "pending":
      return {
        Icon: LuCircleAlert,
        wrapper:
          "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/25",
        iconWrap:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
        title: "در انتظار تأیید پرداخت",
        body: (
          <>فیش واریزی شما ارسال شده و پس از بررسی ادمین، اشتراک فعال می‌شود.</>
        ),
        cta: "مشاهده وضعیت",
        ctaTo: "/subscription/buy",
        urgent: true,
      };

    case "trial_expiring":
      return {
        Icon: LuCircleAlert,
        wrapper:
          "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/25",
        iconWrap:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
        title: "دوره آزمایشی در حال اتمام",
        body: (
          <>
            تنها{" "}
            <span className="font-bold text-amber-800 dark:text-amber-200">
              {trialDays ?? 0} روز
            </span>{" "}
            تا پایان دوره آزمایشی باقی مانده است.
            {dateLine(
              sub.trial_end,
              "text-amber-700/80 dark:text-amber-300/80",
            )}
          </>
        ),
        cta: "تمدید اشتراک",
        ctaTo: "/plans",
        urgent: true,
      };

    case "trial":
      return {
        Icon: LuCircleCheck,
        wrapper: neutral,
        iconWrap: tcIcon,
        title: "دوره آزمایشی فعال",
        body: (
          <>
            شما در حال استفاده از دوره آزمایشی هستید
            {trialDays !== null && (
              <>
                {" "}
                و{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {trialDays} روز
                </span>{" "}
                دیگر باقی مانده است
              </>
            )}
            .{dateLine(sub.trial_end, "text-gray-500 dark:text-gray-400")}
          </>
        ),
        cta: "مشاهده پلن‌ها",
        ctaTo: "/plans",
        urgent: false,
      };

    case "trial_expired":
    case "expired":
      return {
        Icon: LuCircleAlert,
        wrapper:
          "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/25",
        iconWrap:
          "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
        title: "اشتراک شما منقضی شده است",
        body: (
          <>
            برای ادامه استفاده از امکانات پنل، لطفاً اشتراک خود را تمدید کنید.
            {dateLine(sub.trial_end, "text-rose-700/80 dark:text-rose-300/80")}
          </>
        ),
        cta: "فعال‌سازی اشتراک",
        ctaTo: "/plans",
        urgent: true,
      };

    case "active":
      return {
        Icon: LuCircleCheck,
        wrapper:
          "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/25",
        iconWrap:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
        title: planName ? `پلن ${planName}` : "اشتراک شما فعال است",
        body: (
          <>
            اشتراک شما فعال است
            {endDays !== null && endDays > 0 && (
              <>
                {" "}
                و{" "}
                <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                  {endDays} روز
                </span>{" "}
                دیگر اعتبار دارد
              </>
            )}
            .
            {dateLine(
              sub.end_date ?? sub.expires_at,
              "text-emerald-700/80 dark:text-emerald-300/80",
            )}
          </>
        ),
        cta: null,
        ctaTo: "/plans",
        urgent: false,
      };

    default:
      return {
        Icon: LuCreditCard,
        wrapper: neutral,
        iconWrap: tcIcon,
        title: "وضعیت اشتراک",
        body: <>هنوز اشتراکی ثبت نشده. برای شروع یک پلن انتخاب کنید.</>,
        cta: "مشاهده پلن‌ها",
        ctaTo: "/plans",
        urgent: false,
      };
  }
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

interface Props {
  /** null = بدون اشتراک / خطای API */
  subscription: BannerSubscription | null | undefined;
  isLoading?: boolean;
  themeColor: ThemeColorName;
}

export const SubscriptionStatusBanner: React.FC<Props> = ({
  subscription,
  isLoading,
  themeColor,
}) => {
  if (isLoading) {
    return (
      <div
        className="col-span-full animate-pulse rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        aria-busy="true"
        aria-label="در حال بارگذاری وضعیت اشتراک"
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-700/60" />
          </div>
        </div>
      </div>
    );
  }

  // بدون داده → بنر «unknown» با CTA به پلن‌ها
  const safeSub: BannerSubscription = subscription ?? {};
  const v = buildView(safeSub, themeColor);
  const { Icon } = v;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="col-span-full motion-reduce:transition-none"
      role={v.urgent ? "status" : undefined}
      aria-live={v.urgent ? "polite" : undefined}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${v.wrapper}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${v.iconWrap}`}
          >
            <Icon size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-bold text-gray-900 dark:text-gray-50">
              {v.title}
            </h4>
            <div className="mt-1 text-xs leading-6 text-gray-600 dark:text-gray-300">
              {v.body}
            </div>
          </div>

          {v.cta && (
            <Link
              to={v.ctaTo}
              className={`hidden shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none sm:inline-flex ${themeBgSolid[themeColor]}`}
            >
              {v.cta}
              <HiArrowLeft size={12} />
            </Link>
          )}
        </div>

        {v.cta && (
          <Link
            to={v.ctaTo}
            className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:hidden ${themeBgSolid[themeColor]}`}
          >
            {v.cta}
            <HiArrowLeft size={12} />
          </Link>
        )}

        {v.urgent && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-current opacity-40"
            aria-hidden="true"
          />
        )}
      </div>
    </motion.div>
  );
};

export default SubscriptionStatusBanner;
