"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useCallback, useEffect, useState } from "react";
import { AttendanceBar } from "@/components/council/attendance-bar";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useInvalidateCouncil, type CouncilMe } from "@/hooks/use-council-me";
import { cn } from "@/lib/utils";

type Candidate = {
  id: string;
  title: string;
  description: string;
  category: string;
  timesUsed: number;
};

type Approach = { id: string; name: string };

type CandidatesPayload = {
  topicCount: number;
  eligibleCount: number;
  candidates: Candidate[];
  approaches: Approach[];
};

type Props = {
  meeting: NonNullable<CouncilMe["meeting"]>;
  isOrganizer: boolean;
};

export function TopicSelectionScreen({ meeting, isOrganizer }: Props) {
  const invalidate = useInvalidateCouncil();
  const [payload, setPayload] = useState<CandidatesPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [approachId, setApproachId] = useState<string | null>(null);
  const [material, setMaterial] = useState("");
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/candidates`);
      const data = (await res.json()) as CandidatesPayload & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudieron cargar temas");
      setPayload(data);
      setTopicId((prev) => {
        if (prev && data.candidates.some((c) => c.id === prev)) return prev;
        return data.candidates[0]?.id ?? null;
      });
      setApproachId((prev) => {
        if (prev && data.approaches.some((a) => a.id === prev)) return prev;
        return data.approaches[0]?.id ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [meeting.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addTopic(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          category: newCategory,
        }),
      });
      const data = (await res.json()) as { error?: string; topic?: Candidate };
      if (!res.ok) throw new Error(data.error ?? "No se pudo añadir");
      setNewTitle("");
      setNewDescription("");
      setNewCategory("");
      setAdding(false);
      await load();
      if (data.topic) {
        const created = data.topic;
        setTopicId(created.id);
        setPayload((prev) => {
          if (!prev) return prev;
          if (prev.candidates.some((c) => c.id === created.id)) return prev;
          return {
            ...prev,
            topicCount: prev.topicCount + 1,
            candidates: [created, ...prev.candidates],
          };
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  async function confirmSelection() {
    if (!topicId) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/selection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          approachId,
          optionalMaterial: material.trim() || null,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo confirmar");
      await invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  if (!isOrganizer) {
    return (
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center max-w-lg mx-auto">
        <Reveal>
          <h1 className="font-display text-parchment text-3xl sm:text-4xl">
            Fecha confirmada
          </h1>
        </Reveal>
        {meeting.startsAt ? (
          <Reveal delay={0.12}>
            <p className="font-subtitle text-gold text-xl mt-6">
              {format(new Date(meeting.startsAt), "EEEE d MMMM · HH:mm", {
                locale: es,
              })}
            </p>
          </Reveal>
        ) : null}
        {meeting.location ? (
          <Reveal delay={0.2}>
            <p className="font-subtitle text-parchment/55 text-lg mt-3">
              {meeting.location}
            </p>
          </Reveal>
        ) : null}
        <Reveal delay={0.32}>
          <p className="font-subtitle text-parchment/40 text-base mt-10 max-w-[22ch]">
            El organizador está eligiendo el tema.
          </p>
        </Reveal>
        <Reveal delay={0.4} className="mt-10 w-full max-w-sm">
          <AttendanceBar
            meetingId={meeting.id}
            attendance={meeting.attendance}
          />
        </Reveal>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-6 py-10 max-w-lg mx-auto">
      <Reveal>
        <h1 className="font-display text-parchment text-3xl text-center">
          Elegir el tema
        </h1>
      </Reveal>

      {meeting.startsAt ? (
        <Reveal delay={0.08}>
          <p className="font-subtitle text-parchment/45 text-center mt-3 text-sm">
            {format(new Date(meeting.startsAt), "EEE d MMM · HH:mm", {
              locale: es,
            })}
            {meeting.location ? ` · ${meeting.location}` : ""}
          </p>
        </Reveal>
      ) : null}

      <Reveal delay={0.12} className="mt-8 w-full">
        <AttendanceBar
          meetingId={meeting.id}
          attendance={meeting.attendance}
        />
      </Reveal>

      {loading ? (
        <p className="font-subtitle text-parchment/40 text-center mt-16">
          Preparando candidatos…
        </p>
      ) : (
        <Reveal delay={0.18} className="mt-10 flex flex-col gap-8 flex-1">
          {payload && payload.candidates.length === 0 ? (
            <p className="font-subtitle text-parchment/50 text-center text-base">
              {payload.topicCount === 0
                ? "El banco está vacío. Añade el primer tema."
                : "Ningún tema cumple las reglas ahora. Añade uno nuevo."}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {payload?.candidates.map((c) => {
                const selected = topicId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setTopicId(c.id)}
                    className={cn(
                      "text-left border rounded-sm px-4 py-4 transition-colors min-h-11",
                      selected
                        ? "border-gold/55 bg-gold/[0.07]"
                        : "border-parchment/15 hover:border-parchment/30",
                    )}
                  >
                    <p className="font-subtitle text-parchment text-lg">
                      {c.title}
                    </p>
                    <p className="font-body text-parchment/45 text-sm mt-1">
                      {c.category}
                      {c.timesUsed > 0 ? ` · ${c.timesUsed}×` : ""}
                    </p>
                    <p className="font-body text-parchment/55 text-sm mt-2 line-clamp-3">
                      {c.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {payload && payload.approaches.length > 0 ? (
            <div className="flex flex-col gap-3">
              <p className="font-subtitle text-parchment/35 text-sm tracking-[0.16em] uppercase">
                Enfoque
              </p>
              <div className="flex flex-wrap gap-2">
                {payload.approaches.map((a) => {
                  const selected = approachId === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setApproachId(a.id)}
                      className={cn(
                        "min-h-11 px-4 rounded-sm border font-subtitle text-base transition-colors",
                        selected
                          ? "border-gold/55 text-gold bg-gold/[0.07]"
                          : "border-parchment/15 text-parchment/70 hover:border-parchment/30",
                      )}
                    >
                      {a.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <label className="flex flex-col gap-1.5 text-left">
            <span className="font-subtitle text-parchment/70 text-sm">
              Material (opcional)
            </span>
            <input
              className="min-h-11 rounded-sm border border-parchment/20 bg-forest/60 px-3 text-parchment outline-none focus:border-gold/50"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Enlace o referencia"
            />
          </label>

          {adding ? (
            <form onSubmit={addTopic} className="flex flex-col gap-3">
              <Field
                label="Título"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Field
                label="Categoría"
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Filosofía, Historia…"
              />
              <label className="flex flex-col gap-1.5 text-left">
                <span className="font-subtitle text-parchment/70 text-sm">
                  Descripción
                </span>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="rounded-sm border border-parchment/20 bg-forest/60 px-3 py-2 text-parchment outline-none focus:border-gold/50 font-body text-base resize-none"
                />
              </label>
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Guardando…" : "Añadir al banco"}
              </Button>
              <button
                type="button"
                className="font-subtitle text-parchment/40 text-sm min-h-11"
                onClick={() => setAdding(false)}
              >
                Cancelar
              </button>
            </form>
          ) : (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setAdding(true)}
            >
              Añadir tema al banco
            </Button>
          )}

          {error ? (
            <p className="font-body text-sm text-gold" role="alert">
              {error}
            </p>
          ) : null}
        </Reveal>
      )}

      {!loading && !adding ? (
        <Reveal delay={0.28} className="pb-8 pt-6">
          <Button
            className="w-full shadow-[0_0_28px_rgba(200,169,107,0.18)]"
            disabled={!topicId || pending}
            onClick={() => void confirmSelection()}
          >
            {pending ? "Confirmando…" : "Confirmar tema"}
          </Button>
        </Reveal>
      ) : null}
    </div>
  );
}
