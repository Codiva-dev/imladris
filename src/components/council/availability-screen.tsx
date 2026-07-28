"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { useInvalidateCouncil, type CouncilMe } from "@/hooks/use-council-me";

type Status = "DISPONIBLE" | "TAL_VEZ" | "NO_DISPONIBLE";

type Props = {
  meeting: NonNullable<CouncilMe["meeting"]>;
  memberCount: number;
  responseCount: number;
  onSaved?: () => void;
};

const LABELS: { status: Status; label: string }[] = [
  { status: "DISPONIBLE", label: "Sí" },
  { status: "TAL_VEZ", label: "Tal vez" },
  { status: "NO_DISPONIBLE", label: "No" },
];

export function AvailabilityScreen({
  meeting,
  memberCount,
  responseCount,
  onSaved,
}: Props) {
  const invalidate = useInvalidateCouncil();
  const initial = useMemo(() => {
    const map: Record<string, Status> = {};
    for (const slot of meeting.slots) {
      const mine = meeting.myAvailabilities.find((a) => a.slotId === slot.id);
      map[slot.id] = (mine?.status as Status) ?? "DISPONIBLE";
    }
    return map;
  }, [meeting]);

  const [answers, setAnswers] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAnswers(initial);
  }, [initial]);

  async function save() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: Object.entries(answers).map(([slotId, status]) => ({
            slotId,
            status,
          })),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error");
      await invalidate();
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-6 py-10 max-w-lg mx-auto">
      <Reveal>
        <h1 className="font-display text-parchment text-3xl text-center">
          Disponibilidad
        </h1>
        <p className="font-subtitle text-parchment/50 text-center mt-2">
          {responseCount}/{memberCount}
        </p>
      </Reveal>

      <Reveal delay={0.15} className="mt-8 flex flex-col gap-6 flex-1">
        {meeting.slots.map((slot) => (
          <div key={slot.id} className="text-left">
            <p className="font-subtitle text-parchment text-lg mb-3">
              {format(new Date(slot.startsAt), "EEE d MMM · HH:mm", {
                locale: es,
              })}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {LABELS.map(({ status, label }) => {
                const active = answers[slot.id] === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setAnswers((a) => ({ ...a, [slot.id]: status }))
                    }
                    className={`min-h-11 rounded-sm border font-subtitle text-base transition-colors ${
                      active
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-parchment/20 text-parchment/60 hover:border-parchment/40"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {error ? (
          <p className="font-body text-sm text-gold" role="alert">
            {error}
          </p>
        ) : null}
      </Reveal>

      <Reveal delay={0.25} className="pb-8 pt-6">
        <Button className="w-full" disabled={pending} onClick={save}>
          {pending ? "Guardando…" : "Guardar"}
        </Button>
      </Reveal>
    </div>
  );
}
