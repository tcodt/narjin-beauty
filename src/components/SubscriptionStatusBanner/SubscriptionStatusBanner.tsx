import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  LuCircleCheck,
  LuCircleAlert,
  LuCreditCard,
  LuClock,
  LuTriangleAlert,
} from "react-icons/lu";
import { HiArrowLeft } from "react-icons/hi";

import { ThemeColorName } from "../../context/ThemeColor";
import { themeText, themeBgSoft, themeBgSolid } from "../../utils/themeClasses";
import type { Subscription as ApiSubscription } from "../../types/subscription";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type BannerSubscription = Partial<ApiSubscription> & {
  end_date?: string | null;
  is_active?: boolean;
  plan_name?: string | null;
  start_date?: string | null;
  trial_start?: string | null;
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

/** Percent of a period that has elapsed (0–100). Null if unknown. */
const progressPct = (
  startIso: string | null | undefined,
  endIso: string | null | undefined,
): number | null => {
  if (!startIso || !endIso) return null;
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return null;
  const pct = ((Date.now() - s) / (e - s)) * 100;
  return Math.min(100, Math.max(0, pct));
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
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  /** wrapper border + bg */
  wrapper: string;
  /** icon halo bg + text */
  iconWrap: string;
  /** progress bar fill */
  progress: string | null;
  /** 0–100 or null */
  progressPct: number | null;
  /** small kicker label above title */
  kicker: string;
  title: string;
  body: React.ReactNode;
  cta: string | null;
  ctaTo: string;
  urgent: boolean;
  tone: "neutral" | "info" | "warning" | "danger" | "success";
  /** NEW: accent color used by left bar + kicker dot */
  accent: string;
}

const buildView = (sub: BannerSubscription, tc: ThemeColorName): View => {
  const state = deriveState(sub);
  const trialDays = daysUntil(sub.trial_end);
  const endDays = daysUntil(sub.end_date ?? sub.expires_at);
  const planName = sub.plan_name ?? sub.plan?.title ?? null;
  const tcIcon = `${themeBgSoft[tc]} ${themeText[tc]}`;
  const neutralWrap =
    "border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800";
  const accentNeutral = "bg-gray-300 dark:bg-gray-600";

  const trialPct = progressPct(sub.trial_start, sub.trial_end);
  const paidPct = progressPct(sub.start_date, sub.end_date ?? sub.expires_at);

  const dateLine = (iso: string | null | undefined, tone: string) =>
    iso ? (
      <span
        className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 textarea-xs ${tone}`}
      >
        <LuClock size={11} aria-hidden="true" />
        پایان دوره:{" "}
        <time dateTime={iso} className="font-semibold">
          {formatFaDate(iso)}
        </time>
      </span>
    ) : null;

  switch (state) {
    case "pending":
      return {
        Icon: LuClock,
        wrapper:
          "border-amber-200/80 bg-gradient-to-br from-amber-50 to-white dark:border-amber-800/70 dark:from-amber-900/30 dark:to-gray-800",
        iconWrap:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
        progress: null,
        progressPct: null,
        kicker: "در حال بررسی",
        title: "پرداخت شما در انتظار تأیید است",
        body: (
          <>
            فیش واریزی دریافت شد. به‌محض تأیید ادمین، اشتراک شما به‌صورت خودکار
            فعال می‌شود.
          </>
        ),
        cta: "مشاهده وضعیت",
        ctaTo: "/subscription/buy",
        urgent: true,
        tone: "warning",
        accent: "bg-amber-400",
      };

    case "trial_expiring":
      return {
        Icon: LuTriangleAlert,
        wrapper:
          "border-amber-200/80 bg-gradient-to-br from-amber-50 to-white dark:border-amber-800/70 dark:from-amber-900/30 dark:to-gray-800",
        iconWrap:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
        progress: "bg-amber-500",
        progressPct: trialPct,
        kicker: "به پایان نزدیک می‌شود",
        title: "دوره آزمایشی در حال اتمام",
        body: (
          <>
            تنها{" "}
            <span className="font-bold text-amber-800 dark:text-amber-200">
              {trialDays ?? 0} روز
            </span>{" "}
            تا پایان دوره باقی مانده. برای قطع‌نشدن سرویس، اشتراک را تمدید کنید.
            {dateLine(
              sub.trial_end,
              "bg-amber-100/70 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
            )}
          </>
        ),
        cta: "تمدید اشتراک",
        ctaTo: "/plans",
        urgent: true,
        tone: "warning",
        accent: "bg-amber-400",
      };

    case "trial":
      return {
        Icon: LuCircleCheck,
        wrapper: neutralWrap,
        iconWrap: tcIcon,
        progress: "bg-emerald-500",
        progressPct: trialPct,
        kicker: "دوره آزمایشی",
        title: "دوره آزمایشی فعال است",
        body: (
          <>
            {trialDays !== null ? (
              <>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {trialDays} روز
                </span>{" "}
                از دوره آزمایشی شما باقی مانده.
              </>
            ) : (
              <>شما در حال استفاده از دوره آزمایشی هستید.</>
            )}
            {dateLine(
              sub.trial_end,
              "bg-gray-100/80 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300",
            )}
          </>
        ),
        cta: "مشاهده پلن‌ها",
        ctaTo: "/plans",
        urgent: false,
        tone: "info",
        accent: accentNeutral,
      };

    case "trial_expired":
    case "expired":
      return {
        Icon: LuCircleAlert,
        wrapper:
          "border-rose-200/80 bg-gradient-to-br from-rose-50 to-white dark:border-rose-800/70 dark:from-rose-900/30 dark:to-gray-800",
        iconWrap:
          "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
        progress: null,
        progressPct: null,
        kicker: "منقضی شده",
        title: "اشتراک شما منقضی شده است",
        body: (
          <>
            برای ادامه استفاده از امکانات پنل، لطفاً اشتراک خود را تمدید کنید.
            {dateLine(
              sub.trial_end,
              "bg-rose-100/70 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
            )}
          </>
        ),
        cta: "فعال‌سازی اشتراک",
        ctaTo: "/plans",
        urgent: true,
        tone: "danger",
        accent: "bg-rose-400",
      };

    case "active":
      return {
        Icon: LuCircleCheck,
        wrapper:
          "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-800/70 dark:from-emerald-900/30 dark:to-gray-800",
        iconWrap:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
        progress: "bg-emerald-500",
        progressPct: paidPct,
        kicker: planName ? `پلن ${planName}` : "اشتراک فعال",
        title: planName ? `پلن ${planName}` : "اشتراک شما فعال است",
        body: (
          <>
            {endDays !== null && endDays > 0 ? (
              <>
                <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                  {endDays} روز
                </span>{" "}
                دیگر اعتبار دارد.
              </>
            ) : (
              <>اشتراک شما در حال حاضر فعال است.</>
            )}
            {dateLine(
              sub.end_date ?? sub.expires_at,
              "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
            )}
          </>
        ),
        cta: null,
        ctaTo: "/plans",
        urgent: false,
        tone: "success",
        accent: "bg-emerald-400",
      };

    default:
      return {
        Icon: LuCreditCard,
        wrapper: neutralWrap,
        iconWrap: tcIcon,
        progress: null,
        progressPct: null,
        kicker: "شروع کنید",
        title: "هنوز اشتراکی ثبت نشده",
        body: <>برای دسترسی به امکانات پنل، یک پلن انتخاب کنید.</>,
        cta: "مشاهده پلن‌ها",
        ctaTo: "/plans",
        urgent: false,
        tone: "neutral",
        accent: accentNeutral,
      };
  }
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

interface Props {
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
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-24 rounded-full bg-gray-100 dark:bg-gray-700/60" />
            <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-700/60" />
            <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-700/60" />
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700/60" />
          </div>
        </div>
      </div>
    );
  }

  const safeSub: BannerSubscription = subscription ?? {};
  const v = buildView(safeSub, themeColor);
  const { Icon } = v;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="col-span-full motion-reduce:transition-none"
      role={v.urgent ? "status" : undefined}
      aria-live={v.urgent ? "polite" : undefined}
    >
      <div
        className={`group relative overflow-hidden rounded-2xl border p-4 pl-5 shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md ${v.wrapper}`}
      >
        {/* Left accent bar */}
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 right-0 w-1 ${v.accent}`}
        />

        <div className="flex items-start gap-3">
          {/* Icon halo */}
          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-1 ring-black/5 dark:ring-white/10 ${v.iconWrap}`}
            aria-hidden="true"
          >
            <Icon size={20} />
            {v.urgent && (
              <span className="absolute -top-1 -left-1 rounded-full bg-amber-500 px-1.5 py-px text-[9px] font-bold text-white shadow-sm">
                !
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Kicker with tone dot */}
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${v.accent}`}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {v.kicker}
              </span>
            </div>

            <h4 className="mt-0.5 truncate text-[15px] font-bold tracking-tight text-gray-900 dark:text-gray-50">
              {v.title}
            </h4>

            <div className="mt-1 text-[13px] leading-relaxed text-gray-600 dark:text-gray-300">
              {v.body}
            </div>

            {/* Progress bar */}
            {v.progressPct !== null && v.progress && (
              <div
                className="mt-2.5"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(v.progressPct)}
                aria-label="میزان سپری‌شده از دوره"
              >
                <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.07] shadow-inner dark:bg-white/10">
                  <div
                    className={`h-full rounded-full shadow-sm transition-[width] duration-700 ${v.progress}`}
                    style={{
                      width: `${v.progressPct}%`,
                      transitionTimingFunction:
                        "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {v.cta && (
            <Link
              to={v.ctaTo}
              className={`group/btn hidden shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-md ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-px hover:shadow-lg hover:brightness-110 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 motion-reduce:transform-none sm:inline-flex ${themeBgSolid[themeColor]}`}
            >
              {v.cta}
              <HiArrowLeft
                size={12}
                className="transition-transform duration-200 group-hover/btn:-translate-x-1 motion-reduce:transform-none"
              />
            </Link>
          )}
        </div>

        {v.cta && (
          <Link
            to={v.ctaTo}
            className={`group/btn mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 sm:hidden ${themeBgSolid[themeColor]}`}
          >
            {v.cta}
            <HiArrowLeft
              size={12}
              className="transition-transform duration-200 group-hover/btn:-translate-x-1 motion-reduce:transform-none"
            />
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default SubscriptionStatusBanner;
