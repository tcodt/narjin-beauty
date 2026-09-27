import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoDownloadOutline, IoShareOutline } from "react-icons/io5";
import { usePwaInstall } from "../../hooks/usePwaInstall";
import { useThemeColor } from "../../context/ThemeColor";
import { themeBgSolid } from "../../utils/themeClasses";

const isIOS =
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent);

const PwaInstallPrompt: React.FC = () => {
  const {
    canShowBanner,
    hasNativePrompt,
    promptInstall,
    dismiss,
    remindLater,
    isInstalled,
  } = usePwaInstall();
  const { themeColor } = useThemeColor();
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (isInstalled || !canShowBanner) return null;

  const handleInstall = async () => {
    if (hasNativePrompt) {
      await promptInstall();
    } else if (isIOS) {
      setShowIosHelp(true);
    } else {
      // fallback: just dismiss / open instructions
      setShowIosHelp(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {canShowBanner && !showIosHelp && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-x-3 bottom-20 z-40 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2"
            role="dialog"
            aria-label="نصب اپلیکیشن"
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${themeBgSolid[themeColor]} text-white`}
              >
                <IoDownloadOutline className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  نصب اپلیکیشن نارژین
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  برای دسترسی سریع‌تر و تجربهٔ بهتر، اپ را روی صفحهٔ اصلی گوشی
                  نصب کنید.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleInstall}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold text-white ${themeBgSolid[themeColor]}`}
                  >
                    نصب / افزودن به صفحه اصلی
                  </button>
                  <button
                    type="button"
                    onClick={remindLater}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 dark:border-gray-600 dark:text-gray-300"
                  >
                    بعداً یادآوری کن
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="بستن"
              >
                <IoClose className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* راهنمای iOS */}
      <AnimatePresence>
        {showIosHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
            onClick={() => setShowIosHelp(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-5 dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center gap-2">
                <IoShareOutline className="h-6 w-6 text-blue-500" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  نصب روی آیفون / سافاری
                </h3>
              </div>
              <ol className="list-decimal space-y-2 pr-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
                <li>
                  روی دکمهٔ <strong>Share</strong> (مربع با فلش) در پایین سافاری
                  بزنید.
                </li>
                <li>
                  گزینهٔ <strong>Add to Home Screen</strong> را انتخاب کنید.
                </li>
                <li>
                  روی <strong>Add</strong> بزنید.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => {
                  setShowIosHelp(false);
                  dismiss();
                }}
                className={`mt-5 w-full rounded-xl py-3 text-sm font-semibold text-white ${themeBgSolid[themeColor]}`}
              >
                متوجه شدم
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PwaInstallPrompt;
