"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useInvalidateCouncil } from "@/hooks/use-council-me";

type Props = {
  onBack: () => void;
};

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultSlot() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(19, 0, 0, 0);
  return toLocalInputValue(d);
}

export function ConvocationScreen({ onBack }: Props) {
  const invalidate = useInvalidateCouncil();
  const [location, setLocation] = useState("");
  const [slots, setSlots] = useState<string[]>([defaultSlot()]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function addSlot() {
    const d = new Date(slots[slots.length - 1] || defaultSlot());
    d.setDate(d.getDate() + 1);
    setSlots((s) => [...s, toLocalInputValue(d)]);
  }

  async function send() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          slots: slots.map((startsAt) => ({ startsAt: new Date(startsAt).toISOString() })),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo enviar");
      await invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-6 py-10 max-w-lg mx-auto">
      <Reveal>
        <button
          type="button"
          onClick={onBack}
          className="self-start font-subtitle text-parchment/50 text-base min-h-11 px-1 hover:text-parchment/80"
        >
          ← Volver
        </button>
      </Reveal>

      <Reveal delay={0.1} className="mt-6">
        <h1 className="font-display text-parchment text-3xl text-center">
          Nueva convocatoria
        </h1>
      </Reveal>

      <Reveal delay={0.2} className="mt-8 flex flex-col gap-4 flex-1">
        <Field
          label="Lugar"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Opcional"
        />

        <div className="flex flex-col gap-3">
          <span className="font-subtitle text-parchment/70 text-sm text-left">
            Franjas
          </span>
          {slots.map((value, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="datetime-local"
                required
                value={value}
                onChange={(e) => {
                  const next = [...slots];
                  next[index] = e.target.value;
                  setSlots(next);
                }}
                className="flex-1 min-h-11 rounded-sm border border-parchment/20 bg-forest/60 px-3 text-parchment outline-none focus:border-gold/50"
              />
              {slots.length > 1 ? (
                <button
                  type="button"
                  aria-label="Quitar franja"
                  className="min-h-11 min-w-11 inline-flex items-center justify-center text-parchment/50 hover:text-gold"
                  onClick={() => setSlots((s) => s.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.25} />
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            onClick={addSlot}
            className="min-h-11 inline-flex items-center justify-center gap-2 font-subtitle text-gold/80 hover:text-gold"
          >
            <Plus className="h-4 w-4" strokeWidth={1.25} />
            Añadir franja
          </button>
        </div>

        {error ? (
          <p className="font-body text-sm text-gold" role="alert">
            {error}
          </p>
        ) : null}
      </Reveal>

      <Reveal delay={0.3} className="pb-8 pt-6">
        <Button
          className="w-full shadow-[0_0_28px_rgba(200,169,107,0.18)]"
          disabled={pending}
          onClick={send}
        >
          {pending ? "Enviando…" : "Enviar convocatoria"}
        </Button>
      </Reveal>
    </div>
  );
}
