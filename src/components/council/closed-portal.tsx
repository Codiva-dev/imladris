"use client";

import type { ReactNode } from "react";
import { PhaseTransition } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { LeafIcon, ScrollIcon, StarIcon } from "@/components/icons";
import { PHASE_LABELS } from "@/lib/constants";
import { useCouncilStore } from "@/stores/council-store";

/**
 * Portal de entrada — estado CERRADO.
 * Una composición, un CTA: convocar el Consejo.
 */
export function ClosedPortal() {
  const setPhase = useCouncilStore((s) => s.setPhase);

  return (
    <PhaseTransition className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-8 text-gold/80">
        <LeafIcon className="mx-auto h-10 w-10" title="Hoja de Rivendel" />
      </div>

      <p className="font-subtitle text-gold/90 text-xl sm:text-2xl tracking-wide mb-3">
        Imladris
      </p>

      <h1 className="font-display text-parchment text-4xl sm:text-5xl leading-tight max-w-[14ch]">
        El Consejo de Elrond
      </h1>

      <p className="font-body text-parchment/65 text-base sm:text-lg mt-5 max-w-[28ch] leading-relaxed">
        Un lugar que solo cobra vida cuando el Consejo está por reunirse.
      </p>

      <div className="mt-12 w-full max-w-xs">
        <Button
          className="w-full"
          onClick={() => setPhase("CONVOCATORIA")}
          aria-label="Abrir una nueva convocatoria"
        >
          Nueva convocatoria
        </Button>
      </div>

      <nav
        className="mt-16 flex items-center gap-8 text-parchment/45"
        aria-label="Dominios del Consejo"
      >
        <QuietLink icon={<ScrollIcon className="h-5 w-5" />} label="Bitácora" />
        <QuietLink icon={<StarIcon className="h-5 w-5" />} label="Mapa" />
      </nav>

      <p className="mt-10 font-subtitle text-parchment/30 text-sm tracking-[0.18em] uppercase">
        {PHASE_LABELS.CERRADO}
      </p>
    </PhaseTransition>
  );
}

function QuietLink({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-2 min-h-11 min-w-11 text-xs font-body tracking-wide hover:text-parchment/70 transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
