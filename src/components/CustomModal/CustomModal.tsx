import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** اختیاری: عرض بیشتر برای فرم‌های بزرگ */
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

const CustomModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // lock body scroll + restore focus
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus first focusable inside modal
    const t = window.setTimeout(() => {
      const el = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      el?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  // click outside
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        aria-hidden
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-gray-800 sm:rounded-2xl ${sizeClass[size]}`}
        style={{ animation: "modalEnter 0.28s ease-out forwards" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <h3
            id={titleId}
            className="text-base font-bold text-gray-900 dark:text-white"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="بستن"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
};

export default CustomModal;
