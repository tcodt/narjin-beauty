import React, { useMemo, useState, useEffect } from "react";
import {
  FaUsers,
  FaPhoneAlt,
  FaCalendarAlt,
  FaSearch,
  FaTimes,
  FaSyncAlt,
  FaExclamationTriangle,
  FaChevronLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import PageTitle from "../../components/PageTitle/PageTitle";
import { useMyCustomers } from "../../hooks/business/useCustomers";
import { useThemeColor } from "../../context/ThemeColor";
import {
  themeText,
  themeBgSoft,
  themeBgSolid,
  themeRing,
  mediaUrl,
} from "../../utils/themeClasses";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/** Deterministic pastel color from a string — used for avatar fallback bg. */
const stringToHue = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
};

/** Human-friendly Persian number. */
const faNum = (n: number | string): string => Number(n).toLocaleString("fa-IR");

/** Normalize Persian/Arabic digits so search works with any input. */
const normalizeDigits = (s: string): string =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

/* -------------------------------------------------------------------------- */
/*                              Avatar component                              */
/* -------------------------------------------------------------------------- */

const Avatar: React.FC<{
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: number;
}> = ({ src, firstName = "", lastName = "", size = 48 }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.trim() || "؟";
  const hue = stringToHue(`${firstName}${lastName}` || "default");

  const showImage = src && !imgFailed;

  return (
    <div
      className="shrink-0 overflow-hidden rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={mediaUrl(src)}
          alt={`${firstName} ${lastName}`.trim() || "آواتار"}
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-sm font-bold text-white"
          style={{
            background: `linear-gradient(135deg, hsl(${hue} 65% 55%), hsl(${
              (hue + 30) % 360
            } 65% 45%))`,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Skeleton loader                               */
/* -------------------------------------------------------------------------- */

const CustomerSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
    <div className="mt-3 h-3 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
  </div>
);

const SkeletonGrid: React.FC = () => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <CustomerSkeleton key={i} />
    ))}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                              Customer card                                 */
/* -------------------------------------------------------------------------- */

interface CustomerCardProps {
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    image?: string | null;
    appointments_count?: number;
  };
  index: number;
  onClick?: () => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer: c,
  index,
  onClick,
}) => {
  const { themeColor } = useThemeColor();

  const fullName = `${c.first_name} ${c.last_name}`.trim();
  const appointments = c.appointments_count ?? 0;

  // Cap animation delay so long lists don't feel sluggish
  const delay = Math.min(index * 0.03, 0.3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-2xl border border-gray-100 bg-white p-4 text-right shadow-sm outline-none transition hover:shadow-md focus:ring-2 dark:border-gray-700 dark:bg-gray-800 ${themeRing[themeColor]}`}
        aria-label={`مشتری ${fullName}`}
      >
        {/* Top: avatar + name + phone */}
        <div className="flex items-center gap-3">
          <Avatar
            src={c.image}
            firstName={c.first_name}
            lastName={c.last_name}
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {fullName || "بدون نام"}
            </h3>
            <div
              className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
              dir="ltr"
            >
              <FaPhoneAlt size={10} />
              <span className="truncate">{c.phone_number}</span>
            </div>
          </div>
        </div>

        {/* Bottom: appointments count + actions */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
          <div
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${themeBgSoft[themeColor]} ${themeText[themeColor]}`}
          >
            <FaCalendarAlt size={11} />
            <span>{faNum(appointments)} نوبت</span>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={`tel:${c.phone_number}`}
              onClick={(e) => e.stopPropagation()}
              aria-label={`تماس با ${fullName}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <FaPhoneAlt size={12} />
            </a>
            <span className="flex h-8 w-8 items-center justify-center text-gray-300 transition group-hover:text-gray-500">
              <FaChevronLeft size={11} />
            </span>
          </div>
        </div>
      </button>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Main component                                */
/* -------------------------------------------------------------------------- */

const CustomersList: React.FC = () => {
  const {
    data: customers = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useMyCustomers();
  const { themeColor } = useThemeColor();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input → smoother filtering for large lists
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(id);
  }, [search]);

  const filtered = useMemo(() => {
    const q = normalizeDigits(debouncedSearch.trim().toLowerCase());
    if (!q) return customers;

    return customers.filter((c) => {
      const fullName =
        `${c.first_name ?? ""} ${c.last_name ?? ""}`.toLowerCase();
      const phone = normalizeDigits(c.phone_number ?? "");
      return fullName.includes(q) || phone.includes(q);
    });
  }, [customers, debouncedSearch]);

  const isSearching = debouncedSearch.trim().length > 0;
  const total = customers.length;
  const shown = filtered.length;

  /* ------------------------------- Loading ---------------------------------- */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-5 p-4 pb-24">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-10 w-full max-w-xs animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>
        <SkeletonGrid />
      </div>
    );
  }

  /* -------------------------------- Error ----------------------------------- */
  if (isError) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800/40 dark:bg-red-900/20">
          <FaExclamationTriangle
            className="mx-auto mb-3 text-red-500"
            size={24}
          />
          <p className="font-medium text-red-700 dark:text-red-300">
            خطا در دریافت لیست مشتریان
          </p>
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
            لطفاً اتصال اینترنت خود را بررسی کنید.
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
    <div className="mx-auto max-w-5xl space-y-5 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PageTitle title="مشتریان من" />
            {total > 0 && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${themeBgSoft[themeColor]} ${themeText[themeColor]}`}
              >
                {faNum(total)}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isSearching
              ? `${faNum(shown)} از ${faNum(total)} مشتری`
              : `${faNum(total)} مشتری ثبت شده`}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <FaSearch
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={13}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو نام یا شماره..."
            aria-label="جستجوی مشتری"
            className={`primary-input pr-9 pl-9 focus:ring-2 ${themeRing[themeColor]}`}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="پاک کردن جستجو"
              className="absolute left-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
            >
              <FaTimes size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {shown === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-600">
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${themeBgSoft[themeColor]} ${themeText[themeColor]}`}
          >
            {isSearching ? <FaSearch size={26} /> : <FaUsers size={26} />}
          </div>
          <p className="font-medium text-gray-700 dark:text-gray-200">
            {isSearching ? "نتیجه‌ای یافت نشد" : "هنوز مشتری‌ای ثبت نشده"}
          </p>
          <p className="mt-1 max-w-xs px-4 text-sm text-gray-500 dark:text-gray-400">
            {isSearching
              ? "عبارت دیگری را امتحان کنید یا فیلتر جستجو را پاک کنید."
              : "به‌محض ثبت اولین نوبت، مشتریان شما اینجا نمایش داده می‌شوند."}
          </p>
          {isSearching && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white ${themeBgSolid[themeColor]}`}
            >
              <FaTimes size={11} />
              پاک کردن جستجو
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => (
              <CustomerCard
                key={c.id}
                customer={c}
                index={i}
                // Replace with your navigation:
                // onClick={() => navigate(`/customers/${c.id}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CustomersList;
