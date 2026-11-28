import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const strengthMeta = [
  { text: "ضعیف", color: "bg-rose-500" },
  { text: "متوسط", color: "bg-amber-500" },
  { text: "خوب", color: "bg-sky-500" },
  { text: "قوی", color: "bg-emerald-500" },
] as const;

export const StrengthMeter: React.FC<{ score: number; visible: boolean }> = ({
  score,
  visible,
}) => {
  const meta = score > 0 ? strengthMeta[Math.min(3, score - 1)] : null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 pt-1">
            <div className="flex flex-1 gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                    meta && score >= i
                      ? meta.color
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <span
              className="shrink-0 text-xs font-semibold text-gray-600 dark:text-gray-300"
              aria-live="off"
            >
              {meta ? meta.text : "—"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
