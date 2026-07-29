"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

function EyeOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <path
        d="M2.5 12S6.2 5.5 12 5.5 21.5 12 21.5 12 17.8 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="2.75"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <path
        d="M3 4.5 20.5 19.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M9.4 9.7A3 3 0 0 0 12 15a3 3 0 0 0 2.5-1.3M6.2 7.1C4.4 8.5 3.1 10.4 2.5 12c0 0 3.7 6.5 9.5 6.5 1.7 0 3.2-.5 4.5-1.3M10.4 6C10.9 5.7 11.4 5.5 12 5.5c5.8 0 9.5 6.5 9.5 6.5a14 14 0 0 1-1.7 2.3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Campo de contraseña con botón para mostrar u ocultar. */
export function PasswordField({ label, className, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-1.5 text-left">
      <span className="font-subtitle text-parchment/70 text-sm">{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          className={cn(
            "min-h-11 w-full rounded-sm border border-parchment/20 bg-forest/60 pl-3 pr-12 text-parchment outline-none focus:border-gold/50 read-only:bg-forest/40 read-only:text-parchment/80",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 inline-flex min-h-11 min-w-11 items-center justify-center text-parchment/45 transition-colors duration-300 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
        >
          {visible ? <EyeClosedIcon /> : <EyeOpenIcon />}
        </button>
      </span>
    </label>
  );
}
