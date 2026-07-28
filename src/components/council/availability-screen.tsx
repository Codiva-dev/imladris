"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useInvalidateCouncil, type CouncilMe } from "@/hooks/use-council-me";

type Status = "DISPONIBLE" | "TAL_VEZ" | "NO_DISPONIBLE";

type Proposal = {
  id: string;
  topicId: string;
  title: string;
  description: string;
  category: string;
};

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

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [limit, setLimit] = useState(2);
  const [proposalsOpen, setProposalsOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [proposalPending, setProposalPending] = useState(false);

  const loadProposals = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/topic-proposals`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        limit: number;
        open: boolean;
        proposals: Proposal[];
      };
      setLimit(data.limit);
      setProposalsOpen(data.open);
      setProposals(data.proposals);
    } catch {
      // silencioso
    }
  }, [meeting.id]);

  useEffect(() => {
    setAnswers(initial);
  }, [initial]);

  useEffect(() => {
    void loadProposals();
  }, [loadProposals]);

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

  async function addProposal(event: React.FormEvent) {
    event.preventDefault();
    setProposalPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/topic-proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error");
      setTitle("");
      setDescription("");
      setCategory("");
      setAdding(false);
      await loadProposals();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setProposalPending(false);
    }
  }

  async function removeProposal(id: string) {
    setProposalPending(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/meetings/${meeting.id}/topic-proposals?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error");
      await loadProposals();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setProposalPending(false);
    }
  }

  const canAdd = proposalsOpen && proposals.length < limit;

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

        <div className="pt-4 border-t border-parchment/10">
          <p className="font-subtitle text-parchment/35 text-sm tracking-[0.16em] uppercase pt-4 mb-3">
            Temas ({proposals.length}/{limit})
          </p>
          <p className="font-body text-parchment/45 text-sm mb-4 text-left">
            Propón hasta {limit} para el banco del Consejo.
          </p>

          <div className="flex flex-col gap-3">
            {proposals.map((p) => (
              <div
                key={p.id}
                className="border border-parchment/12 rounded-sm px-4 py-3 text-left"
              >
                <p className="font-subtitle text-parchment text-lg">{p.title}</p>
                <p className="font-body text-parchment/40 text-sm mt-1">
                  {p.category}
                </p>
                {proposalsOpen ? (
                  <button
                    type="button"
                    disabled={proposalPending}
                    onClick={() => void removeProposal(p.id)}
                    className="font-subtitle text-parchment/40 text-sm min-h-11 mt-1 hover:text-gold"
                  >
                    Quitar
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {adding && canAdd ? (
            <form
              onSubmit={addProposal}
              className="flex flex-col gap-3 mt-4 text-left"
            >
              <Field
                label="Título"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Field
                label="Categoría"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Filosofía, Historia…"
              />
              <label className="flex flex-col gap-1.5 text-left">
                <span className="font-subtitle text-parchment/70 text-sm">
                  Descripción
                </span>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-sm border border-parchment/20 bg-forest/60 px-3 py-2 text-parchment outline-none focus:border-gold/50 font-body resize-none"
                />
              </label>
              <Button
                type="submit"
                disabled={proposalPending}
                className="w-full"
              >
                {proposalPending ? "Guardando…" : "Añadir propuesta"}
              </Button>
              <button
                type="button"
                className="font-subtitle text-parchment/40 text-sm min-h-11"
                onClick={() => setAdding(false)}
              >
                Cancelar
              </button>
            </form>
          ) : null}

          {!adding && canAdd ? (
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setAdding(true)}
            >
              Proponer un tema
            </Button>
          ) : null}
        </div>

        {error ? (
          <p className="font-body text-sm text-gold" role="alert">
            {error}
          </p>
        ) : null}
      </Reveal>

      <Reveal delay={0.25} className="pb-8 pt-6">
        <Button className="w-full" disabled={pending} onClick={save}>
          {pending ? "Guardando…" : "Guardar disponibilidad"}
        </Button>
      </Reveal>
    </div>
  );
}
