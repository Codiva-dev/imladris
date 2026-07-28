"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useCouncilMe } from "@/hooks/use-council-me";
import { publicLabel } from "@/lib/username";
import { cn } from "@/lib/utils";

type Topic = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "ACTIVO" | "ARCHIVADO";
  timesUsed: number;
  proposedBy: { id: string; name: string; username: string | null } | null;
};

type Approach = { id: string; name: string };

type Rules = {
  noRepeatTopicMonths: number;
  noConsecutiveCategory: boolean;
  candidateCount: number;
  approachCount: number;
  allowFreeCombination: boolean;
  excludeArchivedTopics: boolean;
  topicProposalsPerMember: number;
};

export function BancoScreen() {
  const { data: me, isPending: mePending } = useCouncilMe();
  const isOrganizer = me?.role === "ORGANIZADOR";
  const [topics, setTopics] = useState<Topic[]>([]);
  const [approaches, setApproaches] = useState<Approach[]>([]);
  const [rules, setRules] = useState<Rules | null>(null);
  const [section, setSection] = useState<"temas" | "enfoques" | "reglas">(
    "temas",
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [approachName, setApproachName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const [tRes, aRes, rRes] = await Promise.all([
      fetch("/api/topics"),
      fetch("/api/approaches"),
      fetch("/api/rules"),
    ]);
    if (!tRes.ok || !aRes.ok || !rRes.ok) {
      setError("No se pudo cargar el banco");
      return;
    }
    const tJson = (await tRes.json()) as { topics: Topic[] };
    const aJson = (await aRes.json()) as { approaches: Approach[] };
    const rJson = (await rRes.json()) as { rules: Rules };
    setTopics(tJson.topics);
    setApproaches(aJson.approaches);
    setRules(rJson.rules);
  }, []);

  useEffect(() => {
    if (!isOrganizer) return;
    void load();
  }, [load, isOrganizer]);

  if (mePending) {
    return <div className="min-h-dvh" aria-busy="true" aria-label="Cargando" />;
  }

  if (!isOrganizer) {
    return (
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center gap-6">
        <p className="font-subtitle text-parchment/55 text-lg">
          Solo el organizador gestiona el banco.
        </p>
        <Link
          href="/"
          className="font-subtitle text-parchment/50 min-h-11 inline-flex items-center"
        >
          ← Volver
        </Link>
      </div>
    );
  }

  async function addTopic(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Error");
      setTitle("");
      setDescription("");
      setCategory("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  async function toggleTopic(topic: Topic) {
    const status = topic.status === "ACTIVO" ? "ARCHIVADO" : "ACTIVO";
    const res = await fetch(`/api/topics/${topic.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await load();
  }

  async function addApproach(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/approaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: approachName }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Error");
      setApproachName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  async function removeApproach(id: string) {
    const res = await fetch(`/api/approaches?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) await load();
  }

  async function saveRules(event: React.FormEvent) {
    event.preventDefault();
    if (!rules) return;
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      });
      const json = (await res.json()) as { error?: string; rules?: Rules };
      if (!res.ok) throw new Error(json.error ?? "Error");
      if (json.rules) setRules(json.rules);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-6 py-10 max-w-lg mx-auto w-full">
      <Reveal>
        <h1 className="font-display text-parchment text-3xl text-center">
          Banco
        </h1>
      </Reveal>

      <Reveal delay={0.1} className="mt-8 flex gap-2 justify-center flex-wrap">
        {(
          [
            ["temas", "Temas"],
            ["enfoques", "Enfoques"],
            ["reglas", "Selección"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={cn(
              "min-h-11 px-4 rounded-sm border font-subtitle text-sm transition-colors",
              section === id
                ? "border-gold/55 text-gold bg-gold/[0.07]"
                : "border-parchment/15 text-parchment/65",
            )}
          >
            {label}
          </button>
        ))}
      </Reveal>

      {error ? (
        <p className="font-body text-sm text-gold text-center mt-4" role="alert">
          {error}
        </p>
      ) : null}

      {section === "temas" ? (
        <Reveal delay={0.18} className="mt-8 flex flex-col gap-6 pb-8">
          <form onSubmit={addTopic} className="flex flex-col gap-3">
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
            <Button type="submit" disabled={pending} className="w-full">
              Añadir tema
            </Button>
          </form>

          <div className="flex flex-col gap-3">
            {topics.map((t) => (
              <div
                key={t.id}
                className="border border-parchment/12 rounded-sm px-4 py-3 text-left"
              >
                <p className="font-subtitle text-parchment text-lg">{t.title}</p>
                <p className="font-body text-parchment/40 text-sm mt-1">
                  {t.category}
                  {t.proposedBy ? ` · ${publicLabel(t.proposedBy)}` : ""}
                  {t.timesUsed > 0 ? ` · ${t.timesUsed}×` : ""}
                  {t.status === "ARCHIVADO" ? " · archivado" : ""}
                </p>
                <button
                  type="button"
                  onClick={() => void toggleTopic(t)}
                  className="font-subtitle text-parchment/45 text-sm min-h-11 mt-1 hover:text-gold"
                >
                  {t.status === "ACTIVO" ? "Archivar" : "Reactivar"}
                </button>
              </div>
            ))}
          </div>
        </Reveal>
      ) : null}

      {section === "enfoques" ? (
        <Reveal delay={0.18} className="mt-8 flex flex-col gap-6 pb-8">
          <form onSubmit={addApproach} className="flex flex-col gap-3">
            <Field
              label="Nombre"
              required
              value={approachName}
              onChange={(e) => setApproachName(e.target.value)}
            />
            <Button type="submit" disabled={pending} className="w-full">
              Añadir enfoque
            </Button>
          </form>
          <div className="flex flex-col gap-2">
            {approaches.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 border border-parchment/12 rounded-sm px-4 min-h-11"
              >
                <span className="font-subtitle text-parchment">{a.name}</span>
                <button
                  type="button"
                  onClick={() => void removeApproach(a.id)}
                  className="font-subtitle text-parchment/40 text-sm min-h-11 hover:text-gold"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </Reveal>
      ) : null}

      {section === "reglas" && rules ? (
        <Reveal delay={0.18} className="mt-8 pb-8">
          <form onSubmit={saveRules} className="flex flex-col gap-4 text-left">
            <Field
              label="Meses sin repetir tema"
              type="number"
              min={1}
              max={24}
              value={rules.noRepeatTopicMonths}
              onChange={(e) =>
                setRules({
                  ...rules,
                  noRepeatTopicMonths: Number(e.target.value),
                })
              }
            />
            <Field
              label="Candidatos de tema"
              type="number"
              min={1}
              max={8}
              value={rules.candidateCount}
              onChange={(e) =>
                setRules({
                  ...rules,
                  candidateCount: Number(e.target.value),
                })
              }
            />
            <Field
              label="Enfoques a presentar"
              type="number"
              min={1}
              max={8}
              value={rules.approachCount}
              onChange={(e) =>
                setRules({
                  ...rules,
                  approachCount: Number(e.target.value),
                })
              }
            />
            <Field
              label="Propuestas de tema por miembro"
              type="number"
              min={1}
              max={2}
              value={rules.topicProposalsPerMember}
              onChange={(e) =>
                setRules({
                  ...rules,
                  topicProposalsPerMember: Number(e.target.value),
                })
              }
            />

            {(
              [
                ["noConsecutiveCategory", "Sin categoría consecutiva"],
                ["allowFreeCombination", "Combinación libre de enfoques"],
                ["excludeArchivedTopics", "Excluir archivados"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 min-h-11 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={rules[key]}
                  onChange={(e) =>
                    setRules({ ...rules, [key]: e.target.checked })
                  }
                  className="size-5 accent-[var(--gold)]"
                />
                <span className="font-subtitle text-parchment/75 text-base">
                  {label}
                </span>
              </label>
            ))}

            <Button type="submit" disabled={pending} className="w-full mt-2">
              {pending ? "Guardando…" : "Guardar selección"}
            </Button>
            {saved ? (
              <p className="font-subtitle text-gold text-sm text-center" role="status">
                Guardado
              </p>
            ) : null}
          </form>
        </Reveal>
      ) : null}

      <Link
        href="/"
        className="font-subtitle text-parchment/45 text-center text-base min-h-11 inline-flex items-center justify-center hover:text-parchment/75 mt-auto pb-8"
      >
        ← Volver
      </Link>
    </div>
  );
}
