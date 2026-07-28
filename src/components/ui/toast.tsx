"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type ToastTone = "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastApi = {
  toast: (message: string, tone?: ToastTone) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const reduceMotion = useReducedMotion();

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, tone: ToastTone = "info") => {
    const text = message.trim();
    if (!text) return;
    const id = ++toastId;
    setItems((prev) => [...prev.slice(-2), { id, message: text, tone }]);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      error: (message) => toast(message, "error"),
      info: (message) => toast(message, "info"),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <ToastCard
              key={item.id}
              item={item}
              reduceMotion={Boolean(reduceMotion)}
              onDone={() => dismiss(item.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  reduceMotion,
  onDone,
}: {
  item: ToastItem;
  reduceMotion: boolean;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 5200);
    return () => window.clearTimeout(t);
  }, [onDone]);

  const isError = item.tone === "error";

  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      role={isError ? "alert" : "status"}
      className={
        isError
          ? "pointer-events-auto w-full max-w-sm rounded-sm border border-gold/45 bg-charcoal/95 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          : "pointer-events-auto w-full max-w-sm rounded-sm border border-parchment/20 bg-forest/95 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      }
    >
      <p
        className={
          isError
            ? "font-body text-gold text-sm text-center leading-snug"
            : "font-body text-parchment/85 text-sm text-center leading-snug"
        }
      >
        {item.message}
      </p>
    </motion.div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return ctx;
}
