import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuKeyRound, LuPalette, LuBell } from "react-icons/lu";

import PageTitle from "../../components/PageTitle/PageTitle";
import { ChangePasswordSection } from "../../components/Settings/sections/ChangePasswordSection";
import ColorPicker from "../../components/ColorPicker/ColorPicker";

/* -------------------------------------------------------------------------- */
/* Section registry                                                           */
/* -------------------------------------------------------------------------- */
/**
 * Add a new panel by appending one entry. Nothing else to wire.
 * `id` is stable — used for tabs, URL hash, and localStorage persistence.
 */
type SectionId = "password" | "appearance" | "notifications";

interface SectionDef {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  render: () => React.ReactNode;
  /** Hide from tabs if the section isn't shipped yet. */
  available?: boolean;
}

const SECTIONS: SectionDef[] = [
  {
    id: "appearance",
    label: "ظاهر",
    icon: LuPalette,
    render: () => <ColorPicker />,
    available: true,
  },
  {
    id: "password",
    label: "رمز عبور",
    icon: LuKeyRound,
    render: () => <ChangePasswordSection />,
    available: true,
  },
  {
    id: "notifications",
    label: "اعلان‌ها",
    icon: LuBell,
    render: () => null, // future
    available: false,
  },
];

/* -------------------------------------------------------------------------- */
/* Shell                                                                      */
/* -------------------------------------------------------------------------- */

const Settings: React.FC = () => {
  const available = SECTIONS.filter((s) => s.available);
  const [active, setActive] = useState<SectionId>(
    available[0]?.id ?? "password",
  );

  const activeDef = available.find((s) => s.id === active) ?? available[0];

  const handleTabChange = useCallback((id: SectionId) => {
    setActive(id);
    // Persist so a reload returns the user to the same panel
    try {
      localStorage.setItem("settings:active-section", id);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-1 pb-16 pt-2">
      <header className="space-y-2">
        <PageTitle title="تنظیمات" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          امنیت حساب، ظاهر و اعلان‌ها
        </p>
      </header>

      {/* Tabs */}
      {available.length > 1 && (
        <nav
          aria-label="بخش‌های تنظیمات"
          className="flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 dark:border-gray-800 dark:bg-gray-900"
        >
          {available.map(({ id, label, icon: Icon }) => {
            const isActive = id === active;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500 ${
                  isActive
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Icon size={14} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>
      )}

      {/* Active panel — mounted lazily, unmounted on switch */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeDef.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {activeDef.render()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Settings;
