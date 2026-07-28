"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { MemberGate } from "@/components/auth/member-gate";
import { Reveal } from "@/components/council/phase-transition";

/**
 * Stub ritual — dominio Mapa (solo miembros).
 * Fase 1 será 2D; el cielo 3D llega cuando aporte valor narrativo.
 */
export default function MapaPage() {
  return (
    <MemberGate domain="mapa">
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
        <Reveal>
          <Sparkles
            className="mx-auto mb-8 h-10 w-10 text-gold drop-shadow-[0_0_14px_rgba(200,169,107,0.3)]"
            strokeWidth={1.25}
            aria-hidden
          />
        </Reveal>
        <Reveal delay={0.12}>
          <p className="font-subtitle text-gold text-xl tracking-[0.12em] mb-3">
            Mapa del Conocimiento
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <h1 className="font-display text-parchment text-3xl sm:text-4xl max-w-[14ch] text-balance">
            El cielo aún no tiene estrellas
          </h1>
        </Reveal>
        <Reveal delay={0.38}>
          <p className="font-subtitle text-parchment/65 text-lg mt-5 max-w-[30ch] leading-relaxed">
            Cada tema del Consejo dejará una estrella. Las constelaciones serán
            las categorías. Primero el mapa en dos dimensiones; después, el
            cielo.
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
