"use client";

import { PhaseTransition } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { CompassIcon } from "@/components/icons";
import { useCouncilStore } from "@/stores/council-store";

/** Fase CONVOCATORIA — un CTA: enviar la convocatoria. */
export function ConvocationScreen() {
  const setPhase = useCouncilStore((s) => s.setPhase);
  const quorum = useCouncilStore((s) => s.quorum);

  return (
    <PhaseTransition className="relative z-10 flex min-h-dvh flex-col px-6 py-10 max-w-lg mx-auto">
      <button
        type="button"
        onClick={() => setPhase("CERRADO")}
        className="self-start font-body text-parchment/50 text-sm min-h-11 px-1 hover:text-parchment/80"
      >
        ← Volver
      </button>

      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <CompassIcon className="h-9 w-9 text-gold/80 mb-6" title="Brújula" />
        <h1 className="font-display text-parchment text-3xl sm:text-4xl">
          Nueva convocatoria
        </h1>
        <p className="font-body text-parchment/60 mt-4 max-w-[30ch] leading-relaxed">
          Cada miembro recibirá una notificación e indicará su disponibilidad.
          El quórum del Consejo es del {quorum}%.
        </p>
      </div>

      <div className="pb-8 pt-4">
        <Button className="w-full" onClick={() => setPhase("DISPONIBILIDAD")}>
          Enviar convocatoria
        </Button>
      </div>
    </PhaseTransition>
  );
}
