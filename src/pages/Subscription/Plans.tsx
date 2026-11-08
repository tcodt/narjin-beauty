import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  LuCheck,
  LuX,
  LuChevronLeft,
  LuChevronRight,
  LuSparkles,
  LuCrown,
  LuCircleCheck,
} from "react-icons/lu";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
  usePlans,
  useSubscriptionStatus,
} from "../../hooks/subscription/useSubscription";
import { canUsePanel } from "../../hooks/subscription/useHasFeature";
import PageTitle from "../../components/PageTitle/PageTitle";
import { useThemeColor } from "../../context/ThemeColor";
import {
  themeBgSolid,
  themeText,
  themeBorder,
  themeBgSoft,
} from "../../utils/themeClasses";
import type { Plan } from "../../types/subscription";
import Button from "../../components/Button/Button";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type PlanWithMeta = Plan & { is_popular?: boolean };

interface FeatureRow {
  id: number;
  title: string;
  value: string | null;
  included: boolean;
}

const splitFeatures = (
  plan: Plan,
): { included: FeatureRow[]; excluded: FeatureRow[] } => {
  const rows: FeatureRow[] = (plan.features ?? []).map((f) => {
    const off = f.value === "ندارد" || f.value === "0" || f.value === "";
    const hasValue = !off && f.value !== "دارد" && f.value != null;
    return {
      id: f.feature.id,
      title: f.feature.title,
      value: hasValue ? f.value : null,
      included: !off,
    };
  });
  return {
    included: rows.filter((r) => r.included),
    excluded: rows.filter((r) => !r.included),
  };
};

const formatPrice = (price: number) => price.toLocaleString("fa-IR");

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

const PlansSkeleton: React.FC = () => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="animate-pulse rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
        aria-busy="true"
      >
        <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 h-10 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-3 w-20 rounded bg-gray-100 dark:bg-gray-700/60" />
        <div className="mt-6 space-y-2.5">
          {[0, 1, 2, 3].map((j) => (
            <div
              key={j}
              className="h-4 w-full rounded bg-gray-100 dark:bg-gray-700/60"
            />
          ))}
        </div>
        <div className="mt-6 h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Plan card                                                                  */
/* -------------------------------------------------------------------------- */

interface PlanCardProps {
  plan: PlanWithMeta;
  featured: boolean;
  selected: boolean;
  onSelect: (plan: Plan) => void;
  themeColor: ReturnType<typeof useThemeColor>["themeColor"];
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  featured,
  selected,
  onSelect,
  themeColor,
}) => {
  const { included, excluded } = useMemo(() => splitFeatures(plan), [plan]);
  const [showExcluded, setShowExcluded] = useState(false);
  const perDay =
    plan.duration_days > 0 && plan.price > 0
      ? Math.round(plan.price / plan.duration_days)
      : null;

  /* Two visual modes: featured (filled) vs standard (outline). */
  const surface = featured
    ? `bg-white dark:bg-gray-900 ring-2 ${themeBorder[themeColor]} shadow-xl shadow-black/5`
    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative flex h-full flex-col rounded-3xl p-6 transition-all duration-300 ${surface} ${selected ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100" : ""}`}
      aria-label={`پلن ${plan.title}`}
    >
      {/* Featured ribbon */}
      {featured && (
        <div
          className={`absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full px-3 py-1 textarea-xs font-bold text-white shadow-md ${themeBgSolid[themeColor]}`}
        >
          <LuCrown size={12} />
          پیشنهادی
        </div>
      )}

      {/* Header */}
      <header className="mb-5">
        <h3 className="text-base font-semibold text-gray-500 dark:text-gray-400">
          {plan.title}
        </h3>

        <div className="mt-3 flex items-baseline gap-1.5">
          {plan.price === 0 ? (
            <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              رایگان
            </span>
          ) : (
            <>
              <span
                className={`text-4xl font-extrabold tracking-tight tabular-nums ${
                  featured
                    ? themeText[themeColor]
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {formatPrice(plan.price)}
              </span>
              <span className="text-sm font-medium text-gray-400">تومان</span>
            </>
          )}
        </div>

        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {plan.price > 0 && perDay ? (
            <>
              معادل{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {formatPrice(perDay)} تومان
              </span>{" "}
              در روز · {plan.duration_days} روز اعتبار
            </>
          ) : (
            <>مدت اعتبار: {plan.duration_days} روز</>
          )}
        </p>
      </header>

      {/* Features */}
      <div className="flex-1">
        <p className="mb-3 textarea-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          شامل
        </p>
        <ul className="space-y-2.5">
          {included.map((row) => (
            <li key={row.id} className="flex items-start gap-2.5 text-sm">
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  featured
                    ? `${themeBgSoft[themeColor]} ${themeText[themeColor]}`
                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                }`}
                aria-hidden
              >
                <LuCheck size={10} strokeWidth={3} />
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {row.title}
                {row.value && (
                  <span className="mr-1.5 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {row.value}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        {/* Excluded — collapsed */}
        {excluded.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowExcluded((v) => !v)}
              aria-expanded={showExcluded}
              className="inline-flex items-center gap-1 textarea-xs font-medium text-gray-400 transition hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:hover:text-gray-300"
            >
              <LuX size={10} />
              {excluded.length} مورد بدون دسترسی
              <LuChevronLeft
                size={10}
                className={`transition-transform ${showExcluded ? "-rotate-90" : ""}`}
              />
            </button>
            {showExcluded && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 space-y-1.5 overflow-hidden"
              >
                {excluded.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-start gap-2.5 text-xs text-gray-400 dark:text-gray-500"
                  >
                    <LuX size={12} className="mt-0.5 shrink-0" />
                    <span className="line-through">{row.title}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onSelect(plan)}
        aria-label={`انتخاب پلن ${plan.title}`}
        className={`mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transform-none ${
          featured
            ? `text-white shadow-md ${themeBgSolid[themeColor]}`
            : "border border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        {selected && <LuCircleCheck size={16} />}
        {plan.price === 0 ? "شروع رایگان" : "انتخاب پلن"}
      </button>
    </motion.article>
  );
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const { themeColor } = useThemeColor();
  const { data: plans = [], isPending } = usePlans();
  const { data: sub } = useSubscriptionStatus();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const panelOk = canUsePanel(sub);

  const featuredIndex = useMemo(() => {
    const idx = (plans as PlanWithMeta[]).findIndex((p) => p.is_popular);
    return idx >= 0 ? idx : Math.floor(plans.length / 2);
  }, [plans]);

  const handleSelect = (plan: Plan) => {
    setSelectedId(plan.id);
    sessionStorage.setItem("selected_plan_id", String(plan.id));
    navigate("/subscription/buy");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-1 pb-12 pt-2">
      {/* Header */}
      <header className="space-y-3 text-center">
        <PageTitle title="پلن‌ها و اشتراک" />
        <p className="mx-auto max-w-lg text-sm leading-6 text-gray-500 dark:text-gray-400">
          {!panelOk
            ? "برای فعال‌سازی پنل، یک پلن انتخاب کنید. پس از تأیید پرداخت، دسترسی فعال می‌شود."
            : "پلن فعلی را ارتقا دهید یا دوره جدیدی شروع کنید."}
        </p>

        {!panelOk && (
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800">
            <LuSparkles size={12} />
            پنل شما در انتظار فعال‌سازی است
          </div>
        )}
      </header>

      {/* Body */}
      {isPending ? (
        <PlansSkeleton />
      ) : plans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center dark:border-gray-600 dark:bg-gray-900/50">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <LuSparkles size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            هنوز پلنی تعریف نشده است
          </p>
          <p className="mt-1 text-xs text-gray-400">
            برای اطلاع از پلن‌های آینده با پشتیبانی در تماس باشید.
          </p>
        </div>
      ) : (
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            dir="rtl"
            slidesPerView="auto"
            spaceBetween={16}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            pagination={{
              clickable: true,
              el: ".plans-pagination",
              bulletClass: "plans-bullet",
              bulletActiveClass: "plans-bullet-active",
            }}
            a11y={{
              enabled: true,
              prevSlideMessage: "پلن قبلی",
              nextSlideMessage: "پلن بعدی",
            }}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            onBeforeInit={(swiper) => {
              // Wire refs *before* init so navigation attaches correctly
              // @ts-expect-error Swiper internal — refs are set post-mount
              swiper.params.navigation.prevEl = prevRef.current;
              // @ts-expect-error Swiper internal
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            className="pb-14! pt-6!"
          >
            {(plans as PlanWithMeta[]).map((plan, index) => (
              <SwiperSlide
                key={plan.id}
                style={{ width: "calc(100vw - 5rem)", maxWidth: 360 }}
                className="h-auto! min-h- md:w-auto! md:max-w-none!"
              >
                <PlanCard
                  plan={plan}
                  featured={index === featuredIndex && plans.length > 1}
                  selected={selectedId === plan.id}
                  onSelect={handleSelect}
                  themeColor={themeColor}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Desktop arrows */}
          {plans.length > 1 && (
            <>
              <button
                ref={prevRef}
                type="button"
                aria-label="پلن قبلی"
                className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition hover:-translate-y-1/2 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-30 disabled:hover:scale-100 md:flex dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <LuChevronRight size={18} />
              </button>
              <Button
                ref={nextRef}
                type="button"
                aria-label="پلن بعدی"
                className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition hover:-translate-y-1/2 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-30 disabled:hover:scale-100 md:flex dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <LuChevronLeft size={18} />
              </Button>
            </>
          )}

          {/* Pagination dots */}
          <div className="plans-pagination mt-2 flex items-center justify-center gap-1.5" />
        </div>
      )}

      {/* Steps guide — numbered, more compact */}
      {plans.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-linear-to-br from-gray-50 to-white p-5 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
          <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">
            مراحل فعال‌سازی
          </p>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "پلن را انتخاب کنید",
              "شماره کارت نمایش داده می‌شود",
              "کارت‌به‌کارت و آپلود فیش",
              "تأیید ادمین و فعال‌سازی",
            ].map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-2.5 rounded-xl bg-white p-3 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${themeBgSolid[themeColor]}`}
                >
                  {i + 1}
                </span>
                <span className="text-xs leading-5 text-gray-700 dark:text-gray-300">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
};

export default Plans;
