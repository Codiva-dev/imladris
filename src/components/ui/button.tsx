import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 min-h-11 px-6 rounded-sm",
        "font-subtitle text-lg tracking-wide transition-colors duration-300",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        "disabled:opacity-40 disabled:pointer-events-none",
        variant === "primary" &&
          "bg-gold text-forest hover:bg-[#d4b87a] active:bg-[#b89555]",
        variant === "ghost" &&
          "bg-transparent text-parchment/80 border border-parchment/25 hover:border-gold/50 hover:text-parchment",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
