import { useThemeColor } from "../../context/ThemeColor";
import type { ThemeColorName } from "../../context/ThemeColor";

const colorOptions: { name: ThemeColorName; label: string }[] = [
  { name: "primary-green", label: "سبز اصلی" },
  { name: "orange", label: "نارنجی" },
  { name: "blue", label: "آبی" },
  { name: "red", label: "قرمز" },
  { name: "green", label: "سبز" },
  { name: "purple", label: "بنفش" },
  { name: "yellow", label: "زرد" },
];

const ColorPicker = () => {
  const { themeColor, setThemeColor } = useThemeColor();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
        {colorOptions.map(({ name, label }) => {
          const selected = themeColor === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setThemeColor(name)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                selected
                  ? "ring-2 ring-offset-2 ring-gray-800 dark:ring-white"
                  : ""
              }`}
              style={{ backgroundColor: `var(--color-${name}, currentColor)` }}
              aria-label={label}
              title={label}
            >
              {/* fallback solid via Tailwind safelist classes */}
              <span
                className={`absolute inset-0 rounded-full bg-${name}-500`}
                aria-hidden
              />
              {selected && (
                <span className="relative z-10 text-xs font-bold text-white drop-shadow">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        تم فعلی:
        <span
          className={`inline-block h-5 w-5 rounded-full bg-${themeColor}-500`}
          aria-hidden
        />
      </p>
    </div>
  );
};

export default ColorPicker;
