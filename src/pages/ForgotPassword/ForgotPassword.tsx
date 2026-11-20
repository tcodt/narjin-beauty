import React, { useState } from "react";
import { useNavigate } from "react-router";
import Button from "../../components/Button/Button";
import PageBar from "../../components/PageBar/PageBar";
import { TbPasswordFingerprint } from "react-icons/tb";
import { useThemeColor } from "../../context/ThemeColor";
import { useSendResetCode } from "../../hooks/accounts/send-reset-code/useSendResetCode";
import toast from "react-hot-toast";
import { parseApiError } from "../../utils/parseApiError";
import { useRateLimitGuard } from "../../hooks/useRateLimitGuard";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { themeColor } = useThemeColor();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const sendResetCodeMutation = useSendResetCode();
  const rateLimit = useRateLimitGuard();

  const getBackToPreviousPage = () => {
    navigate(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimit.isLimited) return;

    if (phoneNumber.length !== 11) {
      toast.error("شماره موبایل باید 11 رقم باشد");
      return;
    }

    sendResetCodeMutation.mutate(phoneNumber, {
      onSuccess: () => {
        toast.success("کد تأیید ارسال شد");
        navigate("/receive-code", {
          state: { phoneNumber },
        });
      },
      onError: (error) => {
        rateLimit.triggerFromError(error);
        toast.error(parseApiError(error));
      },
    });
  };

  return (
    <section className="p-4">
      <PageBar title="بازنشانی رمز عبور" handleClick={getBackToPreviousPage} />

      <form className="mt-12 flex flex-col gap-8 pb-4" onSubmit={handleSubmit}>
        <div className="flex items-center justify-center">
          <TbPasswordFingerprint
            size={70}
            className={`text-${themeColor}-500`}
          />
        </div>
        <p className="text-center text-base font-medium text-gray-700 dark:text-gray-200">
          شماره موبایل خود را وارد کنید
        </p>
        <input
          type="tel"
          inputMode="numeric"
          className="primary-input"
          placeholder="شماره موبایل"
          value={phoneNumber}
          onChange={(e) =>
            setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))
          }
          minLength={11}
          maxLength={11}
          disabled={rateLimit.isLimited || sendResetCodeMutation.isPending}
        />
        <Button
          type="submit"
          disabled={
            sendResetCodeMutation.isPending ||
            rateLimit.isLimited ||
            phoneNumber.length !== 11
          }
        >
          {rateLimit.isLimited
            ? `لطفاً ${rateLimit.secondsLeft} ثانیه صبر کنید`
            : sendResetCodeMutation.isPending
              ? "منتظر بمانید..."
              : "ادامه"}
        </Button>

        {rateLimit.isLimited && (
          <p
            className="text-center text-sm text-amber-600 dark:text-amber-400"
            role="status"
            aria-live="polite"
          >
            تعداد درخواست‌ها زیاد است. پس از پایان شمارش می‌توانید دوباره تلاش
            کنید.
          </p>
        )}
      </form>
    </section>
  );
};

export default ForgotPassword;
