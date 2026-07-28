"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { useCallback, useEffect, useState } from "react";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Kind = { id: string; label: string };
type Entry = {
  id: string;
  kind: string;
  body: string;
  visibility: string;
  createdAt: string;
  mine: boolean;
  author: string | null;
};

type Payload = {
  open: boolean;
  meeting: {
    id: string;
    bitacoraOpensAt: string | null;
    bitacoraClosesAt: string | null;
    topic: { id: string; title: string; category: string } | null;
    approach: { id: string; name: string } | null;
  } | null;
  entries: Entry[];
  kinds: Kind[];
  visibilities: string[];
};

const VIS_LABEL: Record<string, string> = {
  PRIVADA: "Privada",
  COMPARTIDA: "Compartida",
  ANONIMA: "Anónima",
};

type Props = {
  embedded?: boolean;
};

export function BitacoraScreen({ embedded = false }: Props) {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState("REFLEXION");
  const [visibility, setVisibility] = useState("PRIVADA");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bitacora");
      const json = (await res.json()) as Payload & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Error");
      setData(json);
      if (json.kinds[0]) setKind((k) => k || json.kinds[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/bitacora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, visibility, body }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "No se pudo guardar");
      setBody("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  if (loading && !data) {
    return <div className="min-h-dvh" aria-busy="true" aria-label="Cargando" />;
  }

  if (!data?.open) {
    return (
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center gap-6">
        <Reveal>
          <h1 className="font-display text-parchment text-3xl">Bitácora</h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="font-subtitle text-parchment/55 text-lg">Cerrada</p>
        </Reveal>
        {!embedded ? (
          <Reveal delay={0.24}>
            <Link
              href="/?portal=1"
              className="font-subtitle text-parchment/50 text-base min-h-11 inline-flex items-center hover:text-parchment/80"
            >
              ← Volver
            </Link>
          </Reveal>
        ) : null}
      </div>
    );
  }

  const kindLabel = (id: string) =>
    data.kinds.find((k) => k.id === id)?.label ?? id;

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-6 py-10 max-w-lg mx-auto w-full">
      <Reveal>
        <h1 className="font-display text-parchment text-3xl text-center">
          Bitácora
        </h1>
      </Reveal>

      {data.meeting?.topic ? (
        <Reveal delay={0.08}>
          <p className="font-subtitle text-gold text-center mt-3 text-lg">
            {data.meeting.topic.title}
          </p>
        </Reveal>
      ) : null}

      {data.meeting?.bitacoraClosesAt ? (
        <Reveal delay={0.12}>
          <p className="font-body text-parchment/40 text-center text-sm mt-2">
            Abierta hasta{" "}
            {format(new Date(data.meeting.bitacoraClosesAt), "d MMM · HH:mm", {
              locale: es,
            })}
          </p>
        </Reveal>
      ) : null}

      <Reveal delay={0.2} className="mt-10">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {data.kinds.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={cn(
                  "min-h-11 px-3 rounded-sm border font-subtitle text-sm transition-colors",
                  kind === k.id
                    ? "border-gold/55 text-gold bg-gold/[0.07]"
                    : "border-parchment/15 text-parchment/65",
                )}
              >
                {k.label}
              </button>
            ))}
          </div>

          <textarea
            required
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Lo que queda del Consejo…"
            className="rounded-sm border border-parchment/20 bg-forest/60 px-3 py-3 text-parchment outline-none focus:border-gold/50 font-body text-base resize-none"
          />

          <div className="flex flex-wrap gap-2">
            {data.visibilities.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className={cn(
                  "min-h-11 px-3 rounded-sm border font-subtitle text-sm transition-colors",
                  visibility === v
                    ? "border-gold/55 text-gold bg-gold/[0.07]"
                    : "border-parchment/15 text-parchment/65",
                )}
              >
                {VIS_LABEL[v] ?? v}
              </button>
            ))}
          </div>

          {error ? (
            <p className="font-body text-sm text-gold" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending || !body.trim()}>
            {pending ? "Guardando…" : "Dejar huella"}
          </Button>
        </form>
      </Reveal>

      <Reveal delay={0.3} className="mt-12 flex flex-col gap-4 pb-10">
        {data.entries.length === 0 ? (
          <p className="font-subtitle text-parchment/35 text-center text-sm">
            Aún no hay entradas
          </p>
        ) : (
          data.entries.map((e) => (
            <article
              key={e.id}
              className="border border-parchment/12 rounded-sm px-4 py-4 text-left"
            >
              <p className="font-subtitle text-parchment/40 text-xs tracking-[0.12em] uppercase">
                {kindLabel(e.kind)}
                {" · "}
                {VIS_LABEL[e.visibility] ?? e.visibility}
                {e.author ? ` · ${e.author}` : ""}
              </p>
              <p className="font-body text-parchment/80 text-base mt-2 whitespace-pre-wrap">
                {e.body}
              </p>
            </article>
          ))
        )}
      </Reveal>

      {!embedded ? (
        <Link
          href="/?portal=1"
          className="font-subtitle text-parchment/45 text-center text-base min-h-11 inline-flex items-center justify-center hover:text-parchment/75 pb-8"
        >
          ← Volver
        </Link>
      ) : (
        <Link
          href="/mapa"
          className="font-subtitle text-gold/80 text-center text-base min-h-11 inline-flex items-center justify-center hover:text-gold pb-8"
        >
          Ver el mapa
        </Link>
      )}
    </div>
  );
}
