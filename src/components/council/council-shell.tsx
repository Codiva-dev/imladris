"use client";

import { ClosedPortal } from "@/components/council/closed-portal";
import { ConvocationScreen } from "@/components/council/convocation-screen";
import { PhaseTransition } from "@/components/council/phase-transition";
import { TransitionSlot } from "@/components/atmosphere/transition-slot";
import { Button } from "@/components/ui/button";
import { PHASE_LABELS, type CouncilPhase } from "@/lib/constants";
import { useCouncilStore } from "@/stores/council-store";

/**
 * Shell gobernado por el estado del Consejo.
 * Una fase activa → una interfaz, con el mismo velo que las rutas.
 */
export function CouncilShell() {
  const phase = useCouncilStore((s) => s.phase);

  return (
    <TransitionSlot transitionKey={phase} skipInitial>
      {phase === "CERRADO" ? (
        <ClosedPortal />
      ) : phase === "CONVOCATORIA" ? (
        <ConvocationScreen />
      ) : (
        <PhasePlaceholder phase={phase} />
      )}
    </TransitionSlot>
  );
}

function PhasePlaceholder({ phase }: { phase: CouncilPhase }) {
  const setPhase = useCouncilStore((s) => s.setPhase);

  return (
    <PhaseTransition className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="font-subtitle text-gold text-xl tracking-wide mb-3">
        {PHASE_LABELS[phase]}
      </p>
      <h1 className="font-display text-parchment text-3xl max-w-[16ch] text-balance">
        Esta fase se construirá a continuación
      </h1>
      <p className="font-subtitle text-parchment/55 text-lg mt-5 max-w-[28ch] leading-relaxed">
        El esqueleto de dominios ya está listo. La UI completa llega dominio a
        dominio.
      </p>
      <Button
        className="mt-10"
        variant="ghost"
        onClick={() => setPhase("CERRADO")}
      >
        Volver al umbral
      </Button>
    </PhaseTransition>
  );
}
