/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useState } from "react";
import { FaWifi, FaEdit, FaTrash, FaRegCreditCard } from "react-icons/fa";
import { MdContentCopy, MdCheckCircle } from "react-icons/md";
import Tilt from "react-parallax-tilt";
import toast from "react-hot-toast";
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
  MehrIranColorIcon,
  ResalatColorIcon,
  KhavarMianehColorIcon,
  IranZaminColorIcon,
  SarmayehColorIcon,
  BluBankColorIcon,
} from "@iran-utils/iranian-banks-react-icons";

import { NumbersCard } from "../../types/payments";

/* -------------------------------------------------------------------------- */
/*                     Iranian bank detection (card BIN)                      */
/* -------------------------------------------------------------------------- */

export type BankInfo = {
  key: string;
  name: string;
  gradient: string;
  Icon: React.ComponentType<{
    width?: number;
    height?: number;
    className?: string;
  }>;
};

export const BANK_REGISTRY: Record<string, Omit<BankInfo, "key">> = {
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

export const DEFAULT_BANK: Omit<BankInfo, "key"> = {
  name: "بانک ناشناس",
  gradient: "from-slate-700 via-slate-800 to-slate-950",
  Icon: FaRegCreditCard,
};

export const normalizeCardNumber = (value: string): string =>
  value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^\d]/g, "");

export const detectBank = (raw: string): BankInfo | null => {
  const digits = normalizeCardNumber(raw);
  if (digits.length < 6) return null;
  const prefix = digits.slice(0, 6);
  const info = BANK_REGISTRY[prefix];
  if (!info) return null;
  return { key: prefix, ...info };
};

export const formatCardNumber = (raw: string): string => {
  const digits = normalizeCardNumber(raw);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

export const maskCardNumber = (raw: string): string => {
  const formatted = formatCardNumber(raw);
  const parts = formatted.split(" ");
  if (parts.length < 4) return formatted;
  return `•••• •••• •••• ${parts[parts.length - 1]}`;
};

/* -------------------------------------------------------------------------- */
/*                              Card component                                */
/* -------------------------------------------------------------------------- */

export interface BankCard3DProps {
  /** The card data */
  card: NumbersCard;

  /** Optional: override detected bank gradient */
  gradient?: string;
  /** Optional: override detected bank name */
  bankName?: string;
  /** Optional: override detected bank icon */
  BankIcon?: React.ComponentType<{
    width?: number;
    height?: number;
    className?: string;
  }>;

  /** Show edit/delete action buttons (default: false) */
  showActions?: boolean;
  /** Called when edit is clicked */
  onEdit?: (card: NumbersCard) => void;
  /** Called when delete is clicked */
  onDelete?: (id: number) => void;

  /** Start flipped to back (default: false) */
  initialFlipped?: boolean;
  /** Show the "click to flip" hint under the card (default: true) */
  showFlipHint?: boolean;
  /** Disable the flip interaction (default: false) */
  disableFlip?: boolean;
  /** Disable tilt effect (default: false) */
  disableTilt?: boolean;

  /** Extra classes on outer wrapper */
  className?: string;
}

const BankCard3D: React.FC<BankCard3DProps> = ({
  card,
  gradient: gradientProp,
  bankName: bankNameProp,
  BankIcon: BankIconProp,
  showActions = false,
  onEdit,
  onDelete,
  initialFlipped = false,
  showFlipHint = true,
  disableFlip = false,
  disableTilt = false,
  className = "",
}) => {
  const detected = detectBank(card.num_code);
  const gradient = gradientProp ?? detected?.gradient ?? DEFAULT_BANK.gradient;
  const bankName =
    bankNameProp ?? detected?.name ?? card.name_bank ?? DEFAULT_BANK.name;
  const BankIcon = BankIconProp ?? detected?.Icon ?? FaRegCreditCard;

  const [flipped, setFlipped] = useState(initialFlipped);
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

  const handleFlip = () => {
    if (disableFlip) return;
    setFlipped((f) => !f);
  };

  /* ---------------------------------------------------------------------- */
  /*  Shared container classes for both faces.                              */
  /*  Aspect ratio keeps it proportional; min/max cap the extremes.         */
  /* ---------------------------------------------------------------------- */
  const faceBase =
    "absolute inset-0 flex flex-col overflow-hidden rounded-2xl text-white";

  const cardBody = (
    <div
      className={`relative w-full select-none rounded-2xl shadow-xl transition-transform duration-700 aspect-16/10 min-h-47.5 max-h-70 ${
        disableFlip ? "" : "cursor-pointer"
      }`}
      style={{
        transformStyle: "preserve-3d",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}
      onClick={handleFlip}
    >
      {/* ---------------------------- FRONT ---------------------------- */}
      <div
        className={`${faceBase} bg-linear-to-br ${gradient} p-3 sm:p-4 md:p-5`}
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
        <div className="relative flex shrink-0 items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/95 shadow-sm sm:h-9 sm:w-9 md:h-10 md:w-10"
              style={{ transform: "translateZ(0)" }}
            >
              <BankIcon width={22} height={22} />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-[9px] text-white/70 sm:text-[10px]">بانک</p>
              <p className="truncate text-xs font-bold sm:text-sm">
                {bankName}
              </p>
            </div>
          </div>

          {!disableFlip && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFlipped((f) => !f);
              }}
              className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-medium backdrop-blur-sm transition hover:bg-white/25 sm:py-1 sm:text-[10px]"
            >
              چرخش ↻
            </button>
          )}
        </div>

        {/* Chip + contactless */}
        <div className="relative mt-3 flex shrink-0 items-center gap-2.5 sm:mt-4 sm:gap-3">
          <div
            className="h-6 w-8 rounded-md sm:h-7 sm:w-10 md:h-8 md:w-11"
            style={{
              background:
                "linear-gradient(135deg, #f5d77a 0%, #d4a12a 40%, #f7e29b 60%, #b8861b 100%)",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
            }}
          >
            <div className="grid h-full w-full grid-cols-2 grid-rows-3 gap-px p-0.5 sm:p-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-sm bg-yellow-900/40" />
              ))}
            </div>
          </div>
          <FaWifi className="rotate-90 text-white/60" size={14} />
        </div>

        {/* Card number — flexible middle area */}
        <div className="relative mt-3 flex min-h-0 flex-1 items-center sm:mt-4">
          <button
            type="button"
            onClick={copyNumber}
            className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-white/5"
            title="کپی شماره کارت"
          >
            <p
              dir="ltr"
              className="truncate font-mono text-sm font-semibold tracking-[0.12em] text-white drop-shadow sm:text-base md:text-lg"
            >
              {formatted}
            </p>
            <span className="shrink-0 text-white/60 transition hover:text-white">
              {copied ? (
                <MdCheckCircle size={16} className="text-emerald-300" />
              ) : (
                <MdContentCopy size={14} />
              )}
            </span>
          </button>
        </div>

        {/* Footer row */}
        <div className="relative mt-2 flex shrink-0 items-end justify-between gap-2 sm:mt-3">
          <div className="min-w-0 leading-tight">
            <p className="text-[8px] uppercase tracking-wider text-white/60 sm:text-[10px]">
              Card Holder
            </p>
            <p className="truncate text-xs font-semibold sm:text-sm">
              {card.card_holder_name}
            </p>
          </div>
          <div className="shrink-0 text-right leading-tight">
            <p className="text-[8px] uppercase tracking-wider text-white/60 sm:text-[10px]">
              Status
            </p>
            <p className="text-[10px] font-medium sm:text-xs">
              {card.status ? "فعال" : "غیرفعال"}
            </p>
          </div>
        </div>

        {card.description ? (
          <p className="relative mt-1 truncate text-[10px] text-white/70 sm:text-xs">
            {card.description}
          </p>
        ) : null}
      </div>

      {/* ---------------------------- BACK ----------------------------- */}
      <div
        className={`${faceBase} bg-linear-to-br ${gradient}`}
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg) translate3d(0, 0, 0)",
        }}
      >
        {/* Magnetic stripe */}
        <div className="mt-4 h-8 w-full shrink-0 bg-black/80 sm:mt-6 sm:h-10" />

        <div className="flex min-h-0 flex-1 flex-col px-3 pt-3 sm:px-5 sm:pt-4">
          <div className="flex shrink-0 items-center gap-2">
            <p className="text-[9px] uppercase tracking-wider text-white/60 sm:text-[10px]">
              CVV2
            </p>
            <div className="flex-1 rounded-md bg-white/95 px-3 py-1 text-right font-mono text-xs font-bold text-slate-900 sm:py-1.5 sm:text-sm">
              •••
            </div>
          </div>

          <div className="mt-2 min-h-0 flex-1 overflow-hidden rounded-lg bg-white/10 p-2.5 text-[10px] leading-relaxed text-white/80 backdrop-blur sm:mt-4 sm:p-3 sm:text-xs">
            این کارت متعلق به {card.card_holder_name} است و برای واریز
            کارت‌به‌کارت استفاده می‌شود.
          </div>

          <div className="mt-2 flex shrink-0 items-center justify-between gap-2 sm:mt-4">
            <div
              className="flex h-6 min-w-0 items-center gap-1.5 rounded-md bg-white/15 px-2 backdrop-blur sm:h-8 sm:gap-2"
              style={{ transform: "translateZ(0)" }}
            >
              <BankIcon width={14} height={14} />
              <span className="truncate text-[9px] font-medium sm:text-xs">
                {bankName}
              </span>
            </div>
            <span
              dir="ltr"
              className="shrink-0 font-mono text-[10px] text-white/70 sm:text-xs"
            >
              {maskCardNumber(card.num_code)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`group relative w-full ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* Action buttons — floating outside the card */}
      {showActions && (
        <div className="absolute -top-3 left-3 z-20 flex gap-1 opacity-0 transition group-hover:opacity-100">
          {onEdit && (
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
          )}
          {onDelete && (
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
          )}
        </div>
      )}

      {!card.status && (
        <div className="absolute -top-2 right-3 z-20 rounded-full bg-gray-900/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          غیرفعال
        </div>
      )}

      {disableTilt ? (
        cardBody
      ) : (
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
          {cardBody}
        </Tilt>
      )}

      {showFlipHint && !disableFlip && (
        <p className="mt-2 text-center text-[10px] text-gray-400">
          برای دیدن پشت کارت کلیک کنید
        </p>
      )}
    </div>
  );
};

export default BankCard3D;
