import React, { useState } from "react";
import {
  FaCheck,
  FaTimes,
  FaImage,
  FaClock,
  FaUser,
  FaPhoneAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

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

const statusMap = {
  pending: {
    label: "در انتظار",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  approved: {
    label: "تأیید شده",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  rejected: {
    label: "رد شده",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  },
} as const;

const ManualPayments: React.FC = () => {
  const { data: payments = [], isLoading } = useManualPayments();
  const reviewMut = useReviewManualPayment();

  const [selected, setSelected] = useState<ManualPayment | null>(null);
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);
  const [note, setNote] = useState("");

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
    reviewMut.mutate(
      {
        id: selected.id,
        payload: { status: action, owner_note: note.trim() || undefined },
      },
      { onSuccess: closeReview },
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 pb-24">
      <div>
        <PageTitle title="فیش‌های پرداخت دستی" />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          بررسی و تأیید فیش‌های کارت‌به‌کارت
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 text-gray-500 dark:border-gray-600">
          <FaClock className="mb-3 opacity-40" size={40} />
          <p>فیشی ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const st = statusMap[p.status];
            return (
              <motion.div
                key={p.id}
                layout
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.className}`}
                      >
                        {st.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(p.created_at).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {Number(p.amount || 0).toLocaleString("fa-IR")} تومان
                    </p>
                    <p className="text-sm text-gray-500">
                      کد پیگیری:{" "}
                      <span dir="ltr" className="font-mono">
                        {p.tracking_code}
                      </span>
                    </p>
                  </div>

                  {p.receipt_image ? (
                    <a
                      href={mediaUrl(p.receipt_image)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <FaImage size={12} />
                      مشاهده فیش
                    </a>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <FaUser size={12} />
                    {p.customer_name}
                  </span>
                  <span className="flex items-center gap-1.5" dir="ltr">
                    <FaPhoneAlt size={12} />
                    {p.customer_phone}
                  </span>
                </div>

                {p.owner_note ? (
                  <p className="mt-2 rounded-xl bg-gray-50 p-2.5 text-sm text-gray-600 dark:bg-gray-700/50 dark:text-gray-300">
                    یادداشت: {p.owner_note}
                  </p>
                ) : null}

                {p.status === "pending" && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openReview(p, "approved")}
                      className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                    >
                      <FaCheck size={13} />
                      تأیید
                    </button>
                    <button
                      type="button"
                      onClick={() => openReview(p, "rejected")}
                      className="flex items-center justify-center gap-2 rounded-full bg-red-600 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      <FaTimes size={13} />
                      رد
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <CustomModal
        isOpen={!!selected && !!action}
        onClose={closeReview}
        title={action === "approved" ? "تأیید فیش" : "رد فیش"}
        size="sm"
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              مبلغ:{" "}
              <strong>
                {Number(selected.amount || 0).toLocaleString("fa-IR")} تومان
              </strong>
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                یادداشت (اختیاری)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-900"
                placeholder="توضیح برای مشتری..."
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={closeReview}>
                انصراف
              </Button>
              <Button
                type="button"
                onClick={submitReview}
                disabled={reviewMut.isPending}
                variant={action === "approved" ? "green" : "delete"}
              >
                تأیید نهایی
              </Button>
            </div>
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default ManualPayments;
