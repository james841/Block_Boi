"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoCloseDuration?: number; // milliseconds
}

export default function SuccessToast({
  message,
  isVisible,
  onClose,
  autoCloseDuration = 5000,
}: SuccessToastProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(onClose, autoCloseDuration);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoCloseDuration, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <div
        className={`relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 px-4 py-3.5 shadow-xl shadow-slate-950/20 transition-all cubic-bezier(0.16, 1, 0.3, 1) duration-300 pointer-events-auto ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-4 opacity-0 scale-95"
        }`}
      >
        {/* Glow effect */}
        <div className="absolute -left-4 top-1/2 -z-10 h-12 w-12 -translate-y-1/2 bg-emerald-500/20 blur-xl" />

        {/* Success Icon */}
        <div className="flex h-5 w-5 items-center justify-center text-emerald-400 flex-shrink-0">
          <CheckCircle className="h-5 w-5" strokeWidth={2.5} />
        </div>

        {/* Message */}
        <p className="text-sm font-medium text-slate-200 pr-2">{message}</p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700"
          aria-label="Close notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Visual Progress Bar Countdown */}
        {isVisible && (
          <div 
            className="absolute bottom-0 left-0 h-0.5 bg-emerald-500 origin-left"
            style={{
              width: "100%",
              animation: `toast-progress ${autoCloseDuration}ms linear forwards`
            }}
          />
        )}
      </div>

      {/* Global Style Injection for the progress bar animation */}
      <style jsx global>{`
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}