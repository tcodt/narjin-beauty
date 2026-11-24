import React from "react";
import { useNavigate, useLocation } from "react-router";
import { LuLock, LuSparkles } from "react-icons/lu";
import Button from "../Button/Button";
import { useThemeColor } from "../../context/ThemeColor";
import { themeBgSolid, themeText, themeBgSoft } from "../../utils/themeClasses";

interface FeatureLockedProps {
  title?: string;
  description?: string;
  /** کلید فیچر قفل‌شده (برای نمایش بهتر و analytics) */
  featureKey?: string | null;
  /** متن دکمه اصلی */
  ctaLabel?: string;
  /** مسیر دکمه اصلی */
  ctaPath?: string;
  /** نمایش دکمه بازگشت */
  showBack?: boolean;
}

const FeatureLocked: React.FC<FeatureLockedProps> = ({
  title = "این قابلیت در پلن فعلی فعال نیست",
  description = "برای استفاده از این بخش، پلن مناسب را انتخاب کنید و پس از تأیید پرداخت از آن استفاده کنید.",
  featureKey,
  ctaLabel = "مشاهده پلن‌ها و ارتقا",
  ctaPath = "/plans",
  showBack = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeColor } = useThemeColor();

  const handleUpgrade = () => {
    navigate(ctaPath, {
      state: {
        from: location.pathname,
        lockedFeature: featureKey ?? undefined,
        reason: "feature_locked",
      },
    });
  };

  return (
    <section
      className="flex min-h-[55vh] flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-14 text-center dark:border-gray-700 dark:bg-gray-900/40"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${themeBgSoft[themeColor]} ${themeText[themeColor]}`}
      >
        <LuLock size={28} aria-hidden />
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm leading-7 text-gray-500 dark:text-gray-400">
          {description}
        </p>
        {featureKey && (
          <p className="pt-1 text-xs text-gray-400 dark:text-gray-500">
            کلید فیچر: <span className="font-mono">{featureKey}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button
          className={`${themeBgSolid[themeColor]} text-white shadow-sm`}
          onClick={handleUpgrade}
        >
          <span className="inline-flex items-center gap-2">
            <LuSparkles size={16} />
            {ctaLabel}
          </span>
        </Button>

        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            بازگشت
          </button>
        )}
      </div>
    </section>
  );
};

export default FeatureLocked;
