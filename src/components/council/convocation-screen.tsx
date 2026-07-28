"use client";

import { Compass } from "lucide-react";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { useCouncilStore } from "@/stores/council-store";

/** Fase CONVOCATORIA — un CTA: enviar la convocatoria. */
export function ConvocationScreen() {
  const setPhase = useCouncilStore((s) => s.setPhase);
  const quorum = useCouncilStore((s) => s.quorum);

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-6 py-10 max-w-lg mx-auto">
      <Reveal>
        <button
          type="button"
          onClick={() => setPhase("CERRADO")}
          className="self-start font-subtitle text-parchment/50 text-base min-h-11 px-1 hover:text-parchment/80 transition-colors"
        >
          ← Volver
        </button>
      </Reveal>

      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <Reveal delay={0.12}>
          <Compass
            className="h-9 w-9 text-gold mb-6 drop-shadow-[0_0_14px_rgba(200,169,107,0.3)]"
            strokeWidth={1.25}
            aria-hidden
          />
        </Reveal>
        <Reveal delay={0.24}>
          <h1 className="font-display text-parchment text-3xl sm:text-4xl text-balance">
            Nueva convocatoria
          </h1>
        </Reveal>
        <Reveal delay={0.38}>
          <p className="font-subtitle text-parchment/65 text-lg mt-5 max-w-[28ch] leading-relaxed">
            Cada miembro recibirá una notificación e indicará su disponibilidad.
            El quórum del Consejo es del {quorum}%.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.5} className="pb-8 pt-4">
        <Button
          className="w-full shadow-[0_0_28px_rgba(200,169,107,0.18)]"
          onClick={() => setPhase("DISPONIBILIDAD")}
        >
          Enviar convocatoria
        </Button>
      </Reveal>
    </div>
  );
}
