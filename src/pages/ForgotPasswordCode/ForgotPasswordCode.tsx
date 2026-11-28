import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageBar from "../../components/PageBar/PageBar";
import { useLocation, useNavigate } from "react-router";
import CodeInput from "../../components/CodeInput/CodeInput";
import Button from "../../components/Button/Button";
import { useThemeColor } from "../../context/ThemeColor";
import { themeText } from "../../utils/themeClasses";
import { useVerifyResetCode } from "../../hooks/accounts/verify-reset-code/useVerifyResetCode";
import { useSendResetCode } from "../../hooks/accounts/send-reset-code/useSendResetCode";
import { parseApiError } from "../../utils/parseApiError";
import { useRateLimitGuard } from "../../hooks/useRateLimitGuard";
import toast from "react-hot-toast";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

/** Must match CodeInput's length and the backend's code length. */
const CODE_LENGTH = 6;

/** How long the resend button stays disabled after a resend. */
const RESEND_COOLDOWN_SEC = 60;

/** sessionStorage key used to back up the reset session. */
const RESET_SESSION_KEY = "reset_session";

const ForgotPasswordCode: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const { themeColor } = useThemeColor();
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber =
    (location.state as { phoneNumber?: string })?.phoneNumber || "";

  const verifyResetCodeMutation = useVerifyResetCode();
  const sendResetCodeMutation = useSendResetCode();
  const verifyRateLimit = useRateLimitGuard();
  const resendRateLimit = useRateLimitGuard();

  const maskedPhone = useMemo(() => {
    if (!phoneNumber) return "شماره نامشخص";
    return `${phoneNumber.slice(0, 4)}***${phoneNumber.slice(-4)}`;
  }, [phoneNumber]);

  /* ------------------------------ Countdown ------------------------------ */

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  /* ------------------------------ Handlers ------------------------------ */

  const handleCodeComplete = useCallback((enteredCode: string) => {
    setCode(enteredCode);
    setIsCodeComplete(enteredCode.length === CODE_LENGTH);
    setInlineError(null);
  }, []);

  const handleCodeChange = useCallback(
    (val: string) => {
      setCode(val);
      setIsCodeComplete(val.length === CODE_LENGTH);
      if (inlineError) setInlineError(null);
    },
    [inlineError],
  );

  const handleResend = () => {
    if (!phoneNumber) {
      toast.error("شماره تلفن یافت نشد");
      navigate("/forgot-password", { replace: true });
      return;
    }
    if (resendCooldown > 0 || sendResetCodeMutation.isPending) return;
    if (resendRateLimit.isLimited) return;

    sendResetCodeMutation.mutate(phoneNumber, {
      onSuccess: () => {
        toast.success("کد جدید ارسال شد");
        setResendCooldown(RESEND_COOLDOWN_SEC);
        setCode("");
        setIsCodeComplete(false);
        setInlineError(null);
        setResetKey((k) => k + 1); // clear the input boxes
      },
      onError: (error) => {
        resendRateLimit.triggerFromError(error);
        toast.error(parseApiError(error) || "ارسال دوباره ناموفق بود");
      },
    });
  };

  const handleSubmit = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    if (!isCodeComplete || code.length !== CODE_LENGTH) {
      toast.error("لطفاً کد را کامل وارد کنید");
      return;
    }

    if (!phoneNumber) {
      toast.error("شماره تلفن یافت نشد!");
      navigate("/forgot-password", { replace: true });
      return;
    }

    if (verifyRateLimit.isLimited) return;

    verifyResetCodeMutation.mutate(
      { phoneNumber, code },
      {
        onSuccess: () => {
          // Backup — survives refresh / remount on /change-password
          try {
            sessionStorage.setItem(
              RESET_SESSION_KEY,
              JSON.stringify({ phoneNumber, code, at: Date.now() }),
            );
          } catch {
            // sessionStorage unavailable — navigation still works
          }

          toast.success("کد تأیید شد");
          navigate("/change-password", {
            state: { phoneNumber, code }, // ← هر دو، نه فقط phoneNumber
            replace: true,
          });
        },
        onError: (error: unknown) => {
          verifyRateLimit.triggerFromError(error);
          const message = parseApiError(error) || "کد وارد شده اشتباه است";
          toast.error(message);
          setInlineError(message);
          setCode("");
          setIsCodeComplete(false);
          setResetKey((k) => k + 1); // remount CodeInput → clears internal state
        },
      },
    );
  };

  const getBackToPreviousPage = () => {
    navigate(-1);
  };

  /* ------------------------------ Labels ------------------------------ */

  const verifyLabel = verifyResetCodeMutation.isPending
    ? "در حال بررسی..."
    : "تایید";

  const resendLabel = resendRateLimit.isLimited
    ? `لطفاً ${resendRateLimit.secondsLeft} ثانیه صبر کنید`
    : sendResetCodeMutation.isPending
      ? "در حال ارسال..."
      : resendCooldown > 0
        ? `ارسال دوباره (${resendCooldown.toLocaleString("fa-IR")})`
        : "ارسال دوباره کد";

  const resendDisabled =
    resendCooldown > 0 ||
    sendResetCodeMutation.isPending ||
    resendRateLimit.isLimited;

  /* ------------------------------ Render ------------------------------ */

  return (
    <section
      dir="rtl"
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-50 p-4 dark:bg-gray-900"
    >
      <PageBar title="کد بازیابی" handleClick={getBackToPreviousPage} />

      <div className="mt-6 flex flex-1 flex-col">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                کد تأیید به شماره زیر ارسال شد
              </p>
              <span
                dir="ltr"
                className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 font-mono text-sm font-bold tabular-nums text-gray-800 dark:bg-gray-700 dark:text-gray-100"
              >
                {maskedPhone}
              </span>
            </div>

            {/* Code input — key forces remount on resetKey change */}
            <div className="flex flex-col gap-2">
              <CodeInput
                key={resetKey}
                length={CODE_LENGTH}
                onComplete={handleCodeComplete}
                onChange={handleCodeChange}
              />
              {inlineError && (
                <p
                  className="text-center text-sm text-rose-600 dark:text-rose-400"
                  role="alert"
                  aria-live="polite"
                >
                  {inlineError}
                </p>
              )}
            </div>

            {/* Resend */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendDisabled}
                className={`rounded text-sm font-medium underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline dark:focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-800 dark:disabled:text-gray-500 ${
                  resendDisabled
                    ? ""
                    : `${themeText[themeColor]} hover:underline`
                }`}
              >
                {resendLabel}
              </button>

              {resendRateLimit.isLimited && (
                <p
                  className="text-center text-xs text-amber-600 dark:text-amber-400"
                  role="status"
                >
                  تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit — pushed to bottom */}
        <div className="mt-auto pt-8">
          <Button
            onClick={handleSubmit}
            disabled={
              verifyResetCodeMutation.isPending ||
              !isCodeComplete ||
              verifyRateLimit.isLimited
            }
            className="h-11 w-full active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none"
            aria-live="polite"
          >
            {verifyLabel}
          </Button>

          {verifyRateLimit.isLimited && (
            <p
              className="mt-2 text-center text-sm text-amber-600 dark:text-amber-400"
              role="status"
            >
              تعداد تلاش‌ها زیاد است. پس از پایان شمارش دوباره تلاش کنید.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordCode;
