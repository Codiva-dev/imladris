import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-gold text-forest hover:bg-[#d4b87a] active:bg-[#b89555]",
  ghost:
    "bg-transparent text-parchment/80 border border-parchment/20 hover:border-gold/45 hover:text-parchment hover:bg-parchment/[0.03]",
} as const;

function buttonClassName(
  variant: keyof typeof variants,
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 min-h-11 px-6 rounded-sm",
    "font-subtitle text-lg tracking-wide transition-colors duration-300",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
    "disabled:opacity-40 disabled:pointer-events-none",
    variants[variant],
    className,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: keyof typeof variants;
  /** Si hay href, se renderiza como enlace (sin anidar button). */
  href?: string;
};

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  href,
  ...props
}: Props) {
  const classes = buttonClassName(variant, className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
