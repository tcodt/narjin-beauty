import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FaPlus,
  FaRegCreditCard,
  FaWifi,
  FaSyncAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import PageTitle from "../../components/PageTitle/PageTitle";
import Button from "../../components/Button/Button";
import CustomModal from "../../components/CustomModal/CustomModal";
import Dots from "../../components/Dots/Dots";
import BankCard3D, {
  detectBank,
  formatCardNumber,
  DEFAULT_BANK,
  type BankInfo,
} from "../../components/BankCard3D/BankCard3D";
import {
  useMyCards,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
} from "../../hooks/payments/useCards";
import { NumbersCard } from "../../types/payments";
import { useThemeColor } from "../../context/ThemeColor";
import { themeBgSolid } from "../../utils/themeClasses"; // ⬅️ ADDED

const schema = z.object({
  num_code: z.string().min(16, "شماره کارت نامعتبر است").max(26),
  name_bank: z.string().min(2, "نام بانک را وارد کنید"),
  card_holder_name: z.string().min(2, "نام صاحب حساب را وارد کنید"),
  description: z.string().optional(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const BankCards: React.FC = () => {
  // ⬅️ ADDED: isError, refetch, isFetching
  const {
    data: cards = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useMyCards();

  const createMut = useCreateCard();
  const updateMut = useUpdateCard();
  const deleteMut = useDeleteCard();
  const { themeColor } = useThemeColor();

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<NumbersCard | null>(null);
  const [detectedBank, setDetectedBank] = useState<BankInfo | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: true,
      num_code: "",
      name_bank: "",
      card_holder_name: "",
      description: "",
    },
  });

  const numCode = watch("num_code");

  useEffect(() => {
    if (!isOpen) return;
    const info = detectBank(numCode ?? "");
    setDetectedBank(info);
    if (info) {
      setValue("name_bank", info.name, { shouldValidate: true });
    }
  }, [numCode, isOpen, setValue]);

  const openCreate = () => {
    setEditing(null);
    setDetectedBank(null);
    reset({
      status: true,
      num_code: "",
      name_bank: "",
      card_holder_name: "",
      description: "",
    });
    setIsOpen(true);
  };

  const openEdit = (card: NumbersCard) => {
    setEditing(card);
    setDetectedBank(detectBank(card.num_code));
    reset({
      num_code: card.num_code,
      name_bank: card.name_bank,
      card_holder_name: card.card_holder_name,
      description: card.description ?? "",
      status: card.status,
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditing(null);
    setDetectedBank(null);
  };

  const onValid = (values: FormValues) => {
    if (editing) {
      updateMut.mutate(
        { id: editing.id, payload: values },
        {
          onSuccess: () => {
            toast.success("کارت با موفقیت ویرایش شد");
            closeModal();
          },
          onError: () => toast.error("ویرایش کارت ناموفق بود"),
        },
      );
    } else {
      createMut.mutate(values, {
        onSuccess: () => {
          toast.success("کارت با موفقیت افزوده شد");
          closeModal();
        },
        onError: () => toast.error("افزودن کارت ناموفق بود"),
      });
    }
  };

  const requestDelete = useCallback((id: number) => {
    setPendingDeleteId(id);
  }, []);

  const confirmDelete = () => {
    if (pendingDeleteId == null) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    deleteMut.mutate(id, {
      onSuccess: () => toast.success("کارت حذف شد"),
      onError: () => toast.error("حذف کارت ناموفق بود"),
    });
  };

  /* ------------------------------- Loading --------------------------------- */
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Dots />
      </div>
    );
  }

  /* ------------------------------- Error ----------------------------------- */
  // ⬅️ ADDED: full error state with retry
  if (isError) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800/40 dark:bg-red-900/20">
          <FaExclamationTriangle
            className="mx-auto mb-3 text-red-500"
            size={24}
          />
          <p className="font-medium text-red-700 dark:text-red-300">
            خطا در دریافت کارت‌ها
          </p>
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
            لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید.
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

  const DetectedIcon = detectedBank?.Icon ?? FaRegCreditCard;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-24">
      <div className="flex items-center justify-between gap-3">
        <div>
          <PageTitle title="کارت‌های بانکی" />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            کارت‌به‌کارت سالن شما
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          // ⬅️ CHANGED: use themeBgSolid instead of dynamic `bg-${themeColor}-500`
          //    (dynamic class names get purged by Tailwind in production)
          className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition hover:brightness-110 ${themeBgSolid[themeColor]}`}
          aria-label="افزودن کارت"
        >
          <FaPlus size={16} />
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 text-gray-500 dark:border-gray-600">
          <FaRegCreditCard className="mb-3 opacity-40" size={40} />
          <p className="mb-4">هنوز کارتی ثبت نشده</p>
          <div className="w-40">
            <Button type="button" onClick={openCreate}>
              افزودن کارت
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 pt-4 sm:grid-cols-1 md:grid-cols-2">
          <AnimatePresence>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                layout // ⬅️ ADDED: smoother reflow animations
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
              >
                <BankCard3D
                  card={card}
                  showActions
                  onEdit={openEdit}
                  onDelete={requestDelete}
                />
                {/* ⬅️ ADDED: business name chip below the card when present */}
                {card.business ? (
                  <p className="mt-2 text-center text-xs text-gray-400">
                    {typeof card.business === "string"
                      ? card.business
                      : card.business.name}
                  </p>
                ) : null}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create / edit modal */}
      <CustomModal
        isOpen={isOpen}
        onClose={closeModal}
        title={editing ? "ویرایش کارت" : "افزودن کارت جدید"}
        size="md"
      >
        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          {/* Live preview */}
          <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/50">
            <div
              className={`relative h-40 overflow-hidden rounded-2xl bg-linear-to-br ${
                detectedBank?.gradient ?? DEFAULT_BANK.gradient
              } p-4 text-white shadow-lg`}
            >
              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/10" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white/95"
                    style={{ transform: "translateZ(0)" }}
                  >
                    <DetectedIcon width={22} height={22} />
                  </div>
                  <span className="text-sm font-bold">
                    {detectedBank?.name ?? "بانک ناشناس"}
                  </span>
                </div>
                <FaWifi className="rotate-90 text-white/60" size={16} />
              </div>
              <p
                dir="ltr"
                className="mt-6 font-mono text-base font-semibold tracking-[0.15em]"
              >
                {formatCardNumber(numCode ?? "") || "•••• •••• •••• ••••"}
              </p>
              <p className="mt-3 text-xs text-white/70">پیش‌نمایش کارت</p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              شماره کارت / شبا
            </label>
            <div className="relative">
              <input
                {...register("num_code")}
                dir="ltr"
                className="primary-input pl-12"
                placeholder="6037 9975 1234 5678"
                inputMode="numeric"
                autoComplete="cc-number"
              />
              {detectedBank && (
                <div
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2"
                  style={{ transform: "translate3d(0, 0, 0)" }}
                >
                  <DetectedIcon width={24} height={24} />
                </div>
              )}
            </div>
            {errors.num_code && (
              <p className="mt-1 text-xs text-red-500">
                {errors.num_code.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              نام بانک
            </label>
            <input
              {...register("name_bank")}
              className="primary-input"
              placeholder="ملت، ملی، سامان..."
              readOnly={!!detectedBank}
            />
            {detectedBank && (
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                بانک به‌صورت خودکار شناسایی شد
              </p>
            )}
            {errors.name_bank && (
              <p className="mt-1 text-xs text-red-500">
                {errors.name_bank.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              نام صاحب حساب
            </label>
            <input
              {...register("card_holder_name")}
              className="primary-input"
            />
            {errors.card_holder_name && (
              <p className="mt-1 text-xs text-red-500">
                {errors.card_holder_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              توضیح (اختیاری)
            </label>
            <input {...register("description")} className="primary-input" />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              {...register("status")}
              className="rounded"
            />
            کارت فعال باشد
          </label>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={closeModal}>
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {editing ? "ذخیره" : "افزودن"}
            </Button>
          </div>
        </form>
      </CustomModal>

      {/* Delete confirm */}
      <CustomModal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        title="حذف کارت"
        size="sm"
      >
        <p className="text-sm text-gray-700 dark:text-gray-200">
          آیا از حذف این کارت مطمئن هستید؟ این عمل قابل بازگشت نیست.
        </p>
        <div className="mt-5 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPendingDeleteId(null)}
          >
            انصراف
          </Button>
          <Button
            type="button"
            onClick={confirmDelete}
            disabled={deleteMut.isPending}
          >
            حذف
          </Button>
        </div>
      </CustomModal>
    </div>
  );
};

export default BankCards;
