"use client";

import { cn } from "@/lib/utils";
import {
  evaluatePassword,
  type PasswordRuleStatus,
} from "@/lib/password";

type Props = {
  password: string;
  className?: string;
};

function CriterionMark({ met }: { met: boolean }) {
  return (
    <span
      className={cn(
        "mt-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
        met
          ? "border-rivendell bg-rivendell/25 text-rivendell"
          : "border-parchment/25 bg-transparent text-transparent",
      )}
      aria-hidden
    >
      <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
        <path
          d="M2.5 6.2 4.8 8.5 9.5 3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function CriterionRow({ rule }: { rule: PasswordRuleStatus }) {
  return (
    <li
      className={cn(
        "flex items-start gap-2 transition-colors duration-300",
        rule.met ? "text-rivendell" : "text-parchment/40",
      )}
    >
      <CriterionMark met={rule.met} />
      <span>
        {rule.label}
        <span className="sr-only">
          {rule.met ? " — cumplido" : " — pendiente"}
        </span>
      </span>
    </li>
  );
}

/** Checklist en vivo de criterios de contraseña en altas. */
export function PasswordCriteria({ password, className }: Props) {
  const rules = evaluatePassword(password);
  const allMet = rules.every((rule) => rule.met);
  const started = password.length > 0;

  return (
    <div
      className={cn("-mt-2 text-left", className)}
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="font-body text-parchment/40 text-xs mb-1.5">
        {started && allMet
          ? "La contraseña cumple los criterios."
          : "La contraseña debe cumplir:"}
      </p>
      <ul className="font-body text-xs flex flex-col gap-1">
        {rules.map((rule) => (
          <CriterionRow key={rule.id} rule={rule} />
        ))}
      </ul>
    </div>
  );
}
