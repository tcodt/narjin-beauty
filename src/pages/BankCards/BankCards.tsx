import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaWifi,
  FaRegCreditCard,
} from "react-icons/fa";
import { MdContentCopy, MdCheckCircle } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import {
  MelliColorIcon,
  MellatColorIcon,
  SaderatColorIcon,
  TejaratColorIcon,
  SepahColorIcon,
  KeshavarziColorIcon,
  MaskanColorIcon,
  PasargadColorIcon,
  SamanColorIcon,
  ParsianColorIcon,
  EghtesadNovinColorIcon,
  SinaColorIcon,
  ShahrColorIcon,
  DeyColorIcon,
  RefahColorIcon,
  ToseeSaderatColorIcon,
  SanatMadanColorIcon,
  KarafarinColorIcon,
  AyandehColorIcon,
  //   GhavaminColorIcon,
  MehrIranColorIcon,
  ResalatColorIcon,
  KhavarMianehColorIcon,
  IranZaminColorIcon,
  //   HekmatColorIcon,
  SarmayehColorIcon,
  BluBankColorIcon,
} from "@iran-utils/iranian-banks-react-icons";
import Tilt from "react-parallax-tilt";
import toast from "react-hot-toast";

import PageTitle from "../../components/PageTitle/PageTitle";
import Button from "../../components/Button/Button";
import CustomModal from "../../components/CustomModal/CustomModal";
import Dots from "../../components/Dots/Dots";
import {
  useMyCards,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
} from "../../hooks/payments/useCards";
import { NumbersCard } from "../../types/payments";
import { useThemeColor } from "../../context/ThemeColor";

/* -------------------------------------------------------------------------- */
/*                     Iranian bank detection (card BIN)                      */
/* -------------------------------------------------------------------------- */

type BankInfo = {
  /** The BIN prefix key */
  key: string;
  /** Persian display name */
  name: string;
  /** Tailwind gradient classes for the card */
  gradient: string;
  /** Icon component from @iran-utils/iranian-banks-react-icons */
  Icon: React.ComponentType<{
    width?: number;
    height?: number;
    className?: string;
  }>;
};

const BANK_REGISTRY: Record<string, Omit<BankInfo, "key">> = {
  "603799": {
    name: "بانک ملی ایران",
    gradient: "from-yellow-500 via-amber-600 to-orange-700",
    Icon: MelliColorIcon,
  },
  "610433": {
    name: "بانک ملت",
    gradient: "from-red-600 via-red-700 to-rose-900",
    Icon: MellatColorIcon,
  },
  "991975": {
    name: "بانک ملت",
    gradient: "from-red-600 via-red-700 to-rose-900",
    Icon: MellatColorIcon,
  },
  "603769": {
    name: "بانک صادرات ایران",
    gradient: "from-blue-700 via-blue-800 to-indigo-900",
    Icon: SaderatColorIcon,
  },
  "585983": {
    name: "بانک تجارت",
    gradient: "from-sky-700 via-blue-800 to-blue-950",
    Icon: TejaratColorIcon,
  },
  "627353": {
    name: "بانک تجارت",
    gradient: "from-sky-700 via-blue-800 to-blue-950",
    Icon: TejaratColorIcon,
  },
  "589210": {
    name: "بانک سپه",
    gradient: "from-yellow-700 via-amber-800 to-yellow-900",
    Icon: SepahColorIcon,
  },
  "603770": {
    name: "بانک کشاورزی",
    gradient: "from-green-700 via-emerald-800 to-green-950",
    Icon: KeshavarziColorIcon,
  },
  "628023": {
    name: "بانک مسکن",
    gradient: "from-orange-600 via-orange-700 to-red-800",
    Icon: MaskanColorIcon,
  },
  "502229": {
    name: "بانک پاسارگاد",
    gradient: "from-yellow-600 via-amber-700 to-yellow-900",
    Icon: PasargadColorIcon,
  },
  "639347": {
    name: "بانک پاسارگاد",
    gradient: "from-yellow-600 via-amber-700 to-yellow-900",
    Icon: PasargadColorIcon,
  },
  "621986": {
    name: "بانک سامان",
    gradient: "from-cyan-600 via-sky-700 to-blue-900",
    Icon: SamanColorIcon,
  },
  "622106": {
    name: "بانک پارسیان",
    gradient: "from-indigo-600 via-blue-800 to-indigo-950",
    Icon: ParsianColorIcon,
  },
  "639194": {
    name: "بانک پارسیان",
    gradient: "from-indigo-600 via-blue-800 to-indigo-950",
    Icon: ParsianColorIcon,
  },
  "627412": {
    name: "بانک اقتصاد نوین",
    gradient: "from-red-700 via-rose-800 to-red-950",
    Icon: EghtesadNovinColorIcon,
  },
  "627760": {
    name: "بانک اقتصاد نوین",
    gradient: "from-red-700 via-rose-800 to-red-950",
    Icon: EghtesadNovinColorIcon,
  },
  "639346": {
    name: "بانک سینا",
    gradient: "from-blue-800 via-indigo-900 to-slate-950",
    Icon: SinaColorIcon,
  },
  "504706": {
    name: "بانک شهر",
    gradient: "from-purple-700 via-fuchsia-800 to-purple-950",
    Icon: ShahrColorIcon,
  },
  "504707": {
    name: "بانک شهر",
    gradient: "from-purple-700 via-fuchsia-800 to-purple-950",
    Icon: ShahrColorIcon,
  },
  "502938": {
    name: "بانک دی",
    gradient: "from-slate-700 via-slate-800 to-slate-950",
    Icon: DeyColorIcon,
  },
  "589463": {
    name: "بانک رفاه کارگران",
    gradient: "from-teal-600 via-emerald-800 to-teal-950",
    Icon: RefahColorIcon,
  },
  "627648": {
    name: "بانک توسعه صادرات",
    gradient: "from-lime-700 via-green-800 to-emerald-950",
    Icon: ToseeSaderatColorIcon,
  },
  "627961": {
    name: "بانک صنعت و معدن",
    gradient: "from-stone-700 via-stone-800 to-neutral-950",
    Icon: SanatMadanColorIcon,
  },
  "627488": {
    name: "بانک کارآفرین",
    gradient: "from-rose-600 via-pink-700 to-rose-950",
    Icon: KarafarinColorIcon,
  },
  "636214": {
    name: "بانک آینده",
    gradient: "from-violet-700 via-purple-800 to-indigo-950",
    Icon: AyandehColorIcon,
  },
  //   "639599": {
  //     name: "بانک قوامین",
  //     gradient: "from-emerald-700 via-teal-800 to-emerald-950",
  //     Icon: null,
  //   },
  "606373": {
    name: "بانک مهر ایران",
    gradient: "from-green-600 via-teal-700 to-emerald-900",
    Icon: MehrIranColorIcon,
  },
  "504172": {
    name: "بانک قرض‌الحسنه رسالت",
    gradient: "from-amber-600 via-orange-700 to-amber-900",
    Icon: ResalatColorIcon,
  },
  "585947": {
    name: "بانک خاورمیانه",
    gradient: "from-slate-600 via-slate-700 to-gray-900",
    Icon: KhavarMianehColorIcon,
  },
  "505785": {
    name: "بانک ایران زمین",
    gradient: "from-cyan-700 via-teal-800 to-cyan-950",
    Icon: IranZaminColorIcon,
  },
  //   "636949": {
  //     name: "بانک حکمت ایرانیان",
  //     gradient: "from-indigo-700 via-blue-900 to-slate-950",
  //     Icon: HekmatColorIcon,
  //   },
  "639607": {
    name: "بانک سرمایه",
    gradient: "from-fuchsia-700 via-purple-800 to-violet-950",
    Icon: SarmayehColorIcon,
  },
  "621672": {
    name: "بلوبانک",
    gradient: "from-blue-500 via-sky-600 to-cyan-700",
    Icon: BluBankColorIcon,
  },
};

const normalizeCardNumber = (value: string): string =>
  value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^\d]/g, "");

const detectBank = (raw: string): BankInfo | null => {
  const digits = normalizeCardNumber(raw);
  if (digits.length < 6) return null;
  const prefix = digits.slice(0, 6);
  const info = BANK_REGISTRY[prefix];
  if (!info) return null;
  return { key: prefix, ...info };
};

/** Format "6037997512345678" → "6037 9975 1234 5678" */
const formatCardNumber = (raw: string): string => {
  const digits = normalizeCardNumber(raw);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

/** Mask all but the last 4 digits for privacy */
const maskCardNumber = (raw: string): string => {
  const formatted = formatCardNumber(raw);
  const parts = formatted.split(" ");
  if (parts.length < 4) return formatted;
  return `•••• •••• •••• ${parts[parts.length - 1]}`;
};

const DEFAULT_BANK: Omit<BankInfo, "key"> = {
  name: "بانک ناشناس",
  gradient: "from-slate-700 via-slate-800 to-slate-950",
  Icon: FaRegCreditCard,
};

/* -------------------------------------------------------------------------- */

const schema = z.object({
  num_code: z.string().min(16, "شماره کارت نامعتبر است").max(26),
  name_bank: z.string().min(2, "نام بانک را وارد کنید"),
  card_holder_name: z.string().min(2, "نام صاحب حساب را وارد کنید"),
  description: z.string().optional(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

/* -------------------------------------------------------------------------- */
/*                              Card component                                */
/* -------------------------------------------------------------------------- */

const BankCard3D: React.FC<{
  card: NumbersCard;
  onEdit: (card: NumbersCard) => void;
  onDelete: (id: number) => void;
}> = ({ card, onEdit, onDelete }) => {
  const bank = detectBank(card.num_code);
  const gradient = bank?.gradient ?? DEFAULT_BANK.gradient;
  const bankName = bank?.name ?? card.name_bank ?? DEFAULT_BANK.name;
  const BankIcon = bank?.Icon ?? FaRegCreditCard;
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatted = useMemo(
    () => formatCardNumber(card.num_code),
    [card.num_code],
  );

  const copyNumber = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(normalizeCardNumber(card.num_code));
      setCopied(true);
      toast.success("شماره کارت کپی شد");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("کپی ناموفق بود");
    }
  };

  return (
    <div className="group relative w-full" style={{ perspective: "1200px" }}>
      {/* Action buttons — floating outside the card */}
      <div className="absolute -top-3 left-3 z-20 flex gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(card);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-md transition hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          aria-label="ویرایش"
        >
          <FaEdit size={13} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/40"
          aria-label="حذف"
        >
          <FaTrash size={13} />
        </button>
      </div>

      {!card.status && (
        <div className="absolute -top-2 right-3 z-20 rounded-full bg-gray-900/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          غیرفعال
        </div>
      )}

      <Tilt
        glareEnable
        glareMaxOpacity={0.15}
        glareColor="#ffffff"
        glarePosition="all"
        tiltMaxAngleX={8}
        tiltMaxAngleY={8}
        transitionSpeed={1200}
        className="rounded-2xl"
      >
        <div
          className="relative h-56 w-full cursor-pointer select-none rounded-2xl shadow-xl transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* ---------------------------- FRONT ---------------------------- */}
          <div
            className={`absolute inset-0 overflow-hidden rounded-2xl bg-linear-to-br ${gradient} p-5 text-white`}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "translate3d(0, 0, 0)",
            }}
          >
            {/* decorative circles */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.18),transparent_45%)]" />

            {/* Header row */}
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 shadow-sm"
                  style={{ transform: "translateZ(0)" }}
                >
                  <BankIcon width={26} height={26} />
                </div>
                <div className="leading-tight">
                  <p className="textarea-xs text-white/70">بانک</p>
                  <p className="text-sm font-bold">{bankName}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped((f) => !f);
                }}
                className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-medium backdrop-blur-sm transition hover:bg-white/25"
              >
                چرخش ↻
              </button>
            </div>

            {/* Chip + contactless */}
            <div className="relative mt-6 flex items-center gap-3">
              <div
                className="h-8 w-11 rounded-md"
                style={{
                  background:
                    "linear-gradient(135deg, #f5d77a 0%, #d4a12a 40%, #f7e29b 60%, #b8861b 100%)",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
                }}
              >
                <div className="grid h-full w-full grid-cols-2 grid-rows-3 gap-px p-1 opacity-40">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-sm bg-yellow-900/40" />
                  ))}
                </div>
              </div>
              <FaWifi className="rotate-90 text-white/60" size={18} />
            </div>

            {/* Card number */}
            <button
              type="button"
              onClick={copyNumber}
              className="relative mt-4 flex w-full items-center justify-between gap-2 rounded-lg px-1 text-left transition hover:bg-white/5"
              title="کپی شماره کارت"
            >
              <p
                dir="ltr"
                className="font-mono text-lg font-semibold tracking-[0.15em] text-white drop-shadow"
              >
                {formatted}
              </p>
              <span className="text-white/60 transition hover:text-white">
                {copied ? (
                  <MdCheckCircle size={16} className="text-emerald-300" />
                ) : (
                  <MdContentCopy size={15} />
                )}
              </span>
            </button>

            {/* Footer row */}
            <div className="relative mt-4 flex items-end justify-between">
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-wider text-white/60">
                  Card Holder
                </p>
                <p className="text-sm font-semibold">{card.card_holder_name}</p>
              </div>
              <div className="text-right leading-tight">
                <p className="text-[10px] uppercase tracking-wider text-white/60">
                  Status
                </p>
                <p className="text-xs font-medium">
                  {card.status ? "فعال" : "غیرفعال"}
                </p>
              </div>
            </div>

            {card.description ? (
              <p className="relative mt-2 truncate textarea-xs text-white/70">
                {card.description}
              </p>
            ) : null}
          </div>

          {/* ---------------------------- BACK ----------------------------- */}
          <div
            className={`absolute inset-0 overflow-hidden rounded-2xl bg-linear-to-br ${gradient} text-white`}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg) translate3d(0, 0, 0)",
            }}
          >
            {/* Magnetic stripe */}
            <div className="mt-6 h-10 w-full bg-black/80" />

            <div className="px-5 pt-4">
              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase tracking-wider text-white/60">
                  CVV2
                </p>
                <div className="flex-1 rounded-md bg-white/95 px-3 py-1.5 text-right font-mono text-sm font-bold text-slate-900">
                  •••
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-white/10 p-3 textarea-xs leading-relaxed text-white/80 backdrop-blur">
                این کارت متعلق به {card.card_holder_name} است و برای واریز
                کارت‌به‌کارت استفاده می‌شود.
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div
                  className="flex h-8 items-center gap-2 rounded-md bg-white/15 px-2 backdrop-blur"
                  style={{ transform: "translateZ(0)" }}
                >
                  <BankIcon width={18} height={18} />
                  <span className="textarea-xs font-medium">{bankName}</span>
                </div>
                <span dir="ltr" className="font-mono text-xs text-white/70">
                  {maskCardNumber(card.num_code)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Tilt>

      {/* Under-card hint */}
      <p className="mt-2 text-center text-[10px] text-gray-400">
        برای دیدن پشت کارت کلیک کنید
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                             Main page component                            */
/* -------------------------------------------------------------------------- */

const BankCards: React.FC = () => {
  const { data: cards = [], isLoading } = useMyCards();
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

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Dots />
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
          className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md bg-${themeColor}-500`}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
              >
                <BankCard3D
                  card={card}
                  onEdit={openEdit}
                  onDelete={requestDelete}
                />
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
              <p className="mt-3 textarea-xs text-white/70">پیش‌نمایش کارت</p>
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
