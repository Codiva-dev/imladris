import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Field({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-left">
      <span className="font-subtitle text-parchment/70 text-sm">{label}</span>
      <input
        className={cn(
          "min-h-11 rounded-sm border border-parchment/20 bg-forest/60 px-3 text-parchment outline-none focus:border-gold/50 read-only:bg-forest/40 read-only:text-parchment/80",
          className,
        )}
        {...props}
      />
    </label>
  );
}
