"use client";

import Link from "next/link";
import { ScrollText } from "lucide-react";
import { MemberGate } from "@/components/auth/member-gate";
import { Reveal } from "@/components/council/phase-transition";

/**
 * Stub ritual — dominio Bitácora (solo miembros).
 * La escritura real abre 72h tras finalizar el Consejo.
 */
export default function BitacoraPage() {
  return (
    <MemberGate domain="bitacora">
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
        <Reveal>
          <ScrollText
            className="mx-auto mb-8 h-10 w-10 text-gold drop-shadow-[0_0_14px_rgba(200,169,107,0.3)]"
            strokeWidth={1.25}
            aria-hidden
          />
        </Reveal>
        <Reveal delay={0.12}>
          <p className="font-subtitle text-gold text-xl tracking-[0.12em] mb-3">
            Bitácora
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <h1 className="font-display text-parchment text-3xl sm:text-4xl max-w-[14ch] text-balance">
            Aún no es tiempo de escribir
          </h1>
        </Reveal>
        <Reveal delay={0.38}>
          <p className="font-subtitle text-parchment/65 text-lg mt-5 max-w-[30ch] leading-relaxed">
            La bitácora se abre durante setenta y dos horas después de que el
            Consejo finaliza. Privada, compartida o anónima — a tu elección.
          </p>
        </Reveal>
        <Reveal delay={0.52} className="mt-12">
          <Link
            href="/"
            className="font-subtitle text-parchment/50 text-base min-h-11 inline-flex items-center hover:text-parchment/80 transition-colors"
          >
            ← Volver al umbral
          </Link>
        </Reveal>
      </div>
    </MemberGate>
  );
}
