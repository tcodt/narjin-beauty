import React, { useState, useRef, useEffect, useCallback } from "react";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";

interface CodeInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onChange?: (code: string) => void;
  disabled?: boolean;
  /** برای ریست از والد */
  resetKey?: number;
}

const themeCell: Record<ThemeColorName, string> = {
  "primary-green":
    "border-primary-green-300 focus:border-primary-green-500 focus:ring-primary-green-500/25 dark:border-primary-green-700 dark:focus:border-primary-green-400",
  orange:
    "border-orange-300 focus:border-orange-500 focus:ring-orange-500/25 dark:border-orange-700 dark:focus:border-orange-400",
  blue: "border-blue-300 focus:border-blue-500 focus:ring-blue-500/25 dark:border-blue-700 dark:focus:border-blue-400",
  red: "border-red-300 focus:border-red-500 focus:ring-red-500/25 dark:border-red-700 dark:focus:border-red-400",
  green:
    "border-green-300 focus:border-green-500 focus:ring-green-500/25 dark:border-green-700 dark:focus:border-green-400",
  purple:
    "border-purple-300 focus:border-purple-500 focus:ring-purple-500/25 dark:border-purple-700 dark:focus:border-purple-400",
  yellow:
    "border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500/25 dark:border-yellow-700 dark:focus:border-yellow-400",
};

const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
  resetKey = 0,
}) => {
  const [code, setCode] = useState<string[]>(() => Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const { themeColor } = useThemeColor();
  const completedRef = useRef(false);

  useEffect(() => {
    setCode(Array(length).fill(""));
    completedRef.current = false;
    inputsRef.current[0]?.focus();
  }, [length, resetKey]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const emit = useCallback(
    (next: string[]) => {
      const joined = next.join("");
      onChange?.(joined);
      if (next.every((d) => d !== "") && !completedRef.current) {
        completedRef.current = true;
        onComplete(joined);
      }
      if (next.some((d) => d === "")) {
        completedRef.current = false;
      }
    },
    [onChange, onComplete],
  );

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    emit(next);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (disabled) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...code];
      if (next[index]) {
        next[index] = "";
        setCode(next);
        emit(next);
      } else if (index > 0) {
        next[index - 1] = "";
        setCode(next);
        emit(next);
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    const next = pasted
      .split("")
      .concat(Array(Math.max(0, length - pasted.length)).fill(""));
    setCode(next);
    emit(next);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div
      className="flex justify-center gap-2 sm:gap-3"
      dir="ltr"
      role="group"
      aria-label="کد تأیید"
    >
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`رقم ${index + 1}`}
          className={`h-12 w-11 rounded-xl border-2 bg-white text-center text-xl font-bold text-gray-900 outline-none transition focus:ring-4 disabled:opacity-50 dark:bg-gray-900 dark:text-white sm:h-14 sm:w-12 sm:text-2xl ${themeCell[themeColor]}`}
        />
      ))}
    </div>
  );
};

export default CodeInput;
