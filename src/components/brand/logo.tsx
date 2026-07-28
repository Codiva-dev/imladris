"use client";

import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Tamaño visual del icono (Tailwind). */
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
};

const SIZE = {
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-11 w-11",
} as const;

/**
 * Marca Imladris — hoja Lucide (+ wordmark opcional).
 */
export function Logo({ className, size = "md", withWordmark = false }: Props) {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-3 text-gold",
        className,
      )}
    >
      <Leaf
        className={cn(
          SIZE[size],
          "drop-shadow-[0_0_18px_rgba(200,169,107,0.35)]",
        )}
        strokeWidth={1.25}
        aria-hidden
      />
      {withWordmark ? (
        <span className="font-subtitle text-gold text-2xl sm:text-3xl tracking-[0.12em]">
          Imladris
        </span>
      ) : (
        <span className="sr-only">Imladris</span>
      )}
    </div>
  );
}
