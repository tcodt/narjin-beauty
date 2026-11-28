import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import PageBar from "../../components/PageBar/PageBar";
import { useLocation, useNavigate } from "react-router";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { IoIosLock } from "react-icons/io";
import Button from "../../components/Button/Button";
import { TbLockPassword } from "react-icons/tb";
import toast from "react-hot-toast";
import { useThemeColor } from "../../context/ThemeColor";
import { themeText } from "../../utils/themeClasses";
import { useResetPassword } from "../../hooks/accounts/reset-password/useResetPassword";
import { parseApiError } from "../../utils/parseApiError";

/* -------------------------------------------------------------------------- */
/* Constants — keep these in sync with the register page's form schema        */
/* -------------------------------------------------------------------------- */

const SESSION_KEY = "reset_session";
const SESSION_MAX_MS = 15 * 60 * 1000; // 15 minutes
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

type ResetSession = {
  phoneNumber: string;
  code: string;
  at: number;
};

function readResetSession(
  state: { phoneNumber?: string; code?: string } | null,
): ResetSession | null {
  // 1) Prefer navigation state (fresh path)
  if (state?.phoneNumber && state?.code) {
    return {
      phoneNumber: state.phoneNumber,
      code: state.code,
      at: Date.now(),
    };
  }

  // 2) Fall back to sessionStorage (survives refresh)
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ResetSession;
    if (
      !parsed?.phoneNumber ||
      !parsed?.code ||
      typeof parsed.at !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.at > SESSION_MAX_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeColor } = useThemeColor();

  const session = useMemo(
    () =>
      readResetSession(
        location.state as { phoneNumber?: string; code?: string } | null,
      ),
    [location.state],
  );

  const phoneNumber = session?.phoneNumber ?? "";
  const code = session?.code ?? "";

  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const resetMutation = useResetPassword();

  const passwordId = useId();
  const passwordErrorId = useId();
  const confirmId = useId();
  const matchId = useId();

  /* ------------------------------ Guards ------------------------------ */

  /**
   * If there's no valid session, redirect to /forgot-password.
   * MUST be in useEffect — calling navigate() during render crashes React
   * and calling toast() during render is unsupported.
   */
  useEffect(() => {
    if (!phoneNumber || !code) {
      toast.error("جلسه بازیابی نامعتبر است. دوباره تلاش کنید.");
      navigate("/forgot-password", { replace: true });
    }
  }, [phoneNumber, code, navigate]);

  /* ------------------------------ Derived state ------------------------------ */

  const passwordLength = newPassword.length;
  const passwordMeetsMin = passwordLength >= MIN_PASSWORD_LENGTH;
  const bothFilled = newPassword.length > 0 && confirmNewPassword.length > 0;
  const passwordsMatch = bothFilled && newPassword === confirmNewPassword;

  const showMismatch = bothFilled && !passwordsMatch;
  const showMatch = bothFilled && passwordsMatch;

  const canSubmit =
    passwordMeetsMin && passwordsMatch && !resetMutation.isPending;

  /* ------------------------------ Handlers ------------------------------ */

  const clearSession = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordMeetsMin) {
      toast.error(`رمز عبور باید حداقل ${MIN_PASSWORD_LENGTH} کاراکتر باشد`);
      return;
    }
    if (!passwordsMatch) {
      toast.error("رمز عبور و تکرار آن یکسان نیستند");
      return;
    }

    resetMutation.mutate(
      { phoneNumber, code, password: newPassword },
      {
        onSuccess: () => {
          clearSession();
          toast.success("رمز عبور با موفقیت تغییر کرد");
          navigate("/login", { replace: true });
        },
        onError: (error) => {
          const message = parseApiError(error) || "خطا در تغییر رمز عبور";
          toast.error(message);

          // If the code is dead (expired / used / invalid), the session is
          // useless — clear it and send the user back to restart the flow.
          // Network errors (no response) keep the session so they can retry.
          const status =
            (error as { response?: { status?: number } })?.response?.status ??
            0;
          if (status === 400 || status === 401 || status === 404) {
            clearSession();
            navigate("/forgot-password", { replace: true });
          }
        },
      },
    );
  };

  const handleBack = () => {
    // Deterministic — if history is weird (refresh landed us on a fresh entry),
    // fall back to the start of the reset flow instead of a random page.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/forgot-password", { replace: true });
    }
  };

  /* Early-return after the effect — the effect will have already navigated. */
  if (!phoneNumber || !code) {
    return null;
  }

  const submitLabel = resetMutation.isPending
    ? "در حال تغییر..."
    : "تغییر رمز عبور";

  return (
    <section
      dir="rtl"
      className="flex min-h-dvh flex-col bg-gray-50 p-4 dark:bg-gray-900"
    >
      <PageBar title="رمز عبور جدید" handleClick={handleBack} />

      <div className="mx-auto mt-6 flex w-full max-w-sm flex-1 flex-col">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            noValidate
            aria-busy={resetMutation.isPending}
          >
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
                <TbLockPassword
                  size={36}
                  className={themeText[themeColor]}
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                رمز عبور جدید خود را وارد کنید
              </p>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <label
                htmlFor={passwordId}
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                رمز عبور جدید
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={isVisible ? "text" : "password"}
                  placeholder="حداقل ۸ کاراکتر"
                  autoComplete="new-password"
                  maxLength={MAX_PASSWORD_LENGTH}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={resetMutation.isPending}
                  aria-invalid={passwordLength > 0 && !passwordMeetsMin}
                  aria-describedby={passwordErrorId}
                  className="primary-input h-11 w-full ps-10 pe-10"
                />
                <span className="pointer-events-none absolute inset-y-0 inset-s-3 flex items-center text-gray-400 dark:text-gray-500">
                  <IoIosLock size={18} aria-hidden="true" />
                </span>
                <button
                  type="button"
                  onClick={() => setIsVisible((v) => !v)}
                  aria-label={isVisible ? "مخفی کردن رمز" : "نمایش رمز"}
                  aria-pressed={isVisible}
                  disabled={resetMutation.isPending}
                  className="absolute inset-y-0 inset-e-2 my-auto rounded p-1.5 text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-gray-500 dark:hover:text-gray-200 dark:focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-800"
                >
                  {isVisible ? (
                    <IoEye size={18} aria-hidden="true" />
                  ) : (
                    <IoEyeOff size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              {/* Live length indicator */}
              <div
                id={passwordErrorId}
                className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500"
              >
                <span className="flex items-center gap-1" aria-hidden="true">
                  {Array.from({ length: MIN_PASSWORD_LENGTH }).map((_, i) => (
                    <span
                      key={i}
                      className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${
                        i < passwordLength
                          ? passwordMeetsMin
                            ? "bg-emerald-500"
                            : "bg-gray-400 dark:bg-gray-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </span>
                <span>
                  {passwordMeetsMin
                    ? "طول رمز کافی است"
                    : `حداقل ${MIN_PASSWORD_LENGTH} کاراکتر (${passwordLength}/${MIN_PASSWORD_LENGTH})`}
                </span>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label
                htmlFor={confirmId}
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                تکرار رمز عبور
              </label>
              <div className="relative">
                <input
                  id={confirmId}
                  type={isConfirmVisible ? "text" : "password"}
                  placeholder="تکرار رمز عبور"
                  autoComplete="new-password"
                  maxLength={MAX_PASSWORD_LENGTH}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={resetMutation.isPending}
                  aria-invalid={showMismatch}
                  aria-describedby={showMismatch ? matchId : undefined}
                  className={`primary-input h-11 w-full ps-10 pe-10 ${
                    showMismatch
                      ? "outline-1 outline-red-400 dark:outline-red-500 focus:outline-red-500"
                      : ""
                  }`}
                />
                <span className="pointer-events-none absolute inset-y-0 inset-s-3 flex items-center text-gray-400 dark:text-gray-500">
                  <IoIosLock size={18} aria-hidden="true" />
                </span>
                <button
                  type="button"
                  onClick={() => setIsConfirmVisible((v) => !v)}
                  aria-label={isConfirmVisible ? "مخفی کردن رمز" : "نمایش رمز"}
                  aria-pressed={isConfirmVisible}
                  disabled={resetMutation.isPending}
                  className="absolute inset-y-0 inset-e-2 my-auto rounded p-1.5 text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-gray-500 dark:hover:text-gray-200 dark:focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-800"
                >
                  {isConfirmVisible ? (
                    <IoEye size={18} aria-hidden="true" />
                  ) : (
                    <IoEyeOff size={18} aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Live match indicator */}
              <div className="min-h-4">
                {showMismatch && (
                  <p
                    id={matchId}
                    className="text-xs text-red-500 dark:text-red-400"
                    role="alert"
                    aria-live="polite"
                  >
                    رمز عبور و تکرار آن یکسان نیستند
                  </p>
                )}
                {showMatch && (
                  <p
                    className="text-xs text-emerald-600 dark:text-emerald-400"
                    role="status"
                    aria-live="polite"
                  >
                    رمز عبور مطابقت دارد
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!canSubmit || resetMutation.isPending}
              className="h-11 w-full active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none"
              aria-live="polite"
            >
              {submitLabel}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ChangePassword;
