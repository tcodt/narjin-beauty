import React, { useMemo, useState } from "react";
import { FaUsers, FaPhoneAlt, FaCalendarAlt, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";

import PageTitle from "../../components/PageTitle/PageTitle";
import Dots from "../../components/Dots/Dots";
import { useMyCustomers } from "../../hooks/business/useCustomers";
import { useThemeColor } from "../../context/ThemeColor";
import { themeText, themeBgSoft, mediaUrl } from "../../utils/themeClasses";

const CustomersList: React.FC = () => {
  const { data: customers = [], isLoading, isError } = useMyCustomers();
  const [search, setSearch] = useState("");
  const { themeColor } = useThemeColor();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.phone_number.includes(q),
    );
  }, [customers, search]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-4 mt-6 rounded-2xl bg-red-50 p-6 text-center text-red-600 dark:bg-red-900/20">
        خطا در دریافت لیست مشتریان
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageTitle title="مشتریان من" />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {customers.length.toLocaleString("fa-IR")} مشتری
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <FaSearch
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو نام یا شماره..."
            className="primary-input pr-8"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 text-gray-500 dark:border-gray-600">
          <FaUsers className="mb-3 opacity-40" size={40} />
          <p>مشتری‌ای یافت نشد</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${themeBgSoft[themeColor]} ${themeText[themeColor]}`}
                >
                  {c.image ? (
                    <img
                      src={mediaUrl(c.image)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    `${c.first_name?.[0] ?? ""}${c.last_name?.[0] ?? ""}`
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                    {c.first_name} {c.last_name}
                  </h3>
                  <div
                    className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500"
                    dir="ltr"
                  >
                    <FaPhoneAlt size={11} />
                    {c.phone_number}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-2.5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
                <FaCalendarAlt size={13} />
                <span>
                  {(c.appointments_count ?? 0).toLocaleString("fa-IR")} نوبت
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomersList;
