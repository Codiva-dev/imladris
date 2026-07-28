"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MemberGate } from "@/components/auth/member-gate";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";

type Payload = {
  councilName: string;
  body: string;
  isDefault: boolean;
  canEdit: boolean;
};

/** Render mínimo de markdown: ## títulos y párrafos. */
function ReglamentoBody({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-6 text-left">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="font-subtitle text-gold text-lg tracking-wide pt-2"
            >
              {block.replace(/^##\s+/, "")}
            </h2>
          );
        }
        const html = block
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\n/g, "<br />");
        return (
          <p
            key={i}
            className="font-body text-parchment/75 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}

function ReglamentoScreen() {
  const [data, setData] = useState<Payload | null>(null);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reglamento");
      const json = (await res.json()) as Payload & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Error");
      setData(json);
      setDraft(json.body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/reglamento", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      const json = (await res.json()) as Payload & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Error");
      setEditing(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  async function resetDefault() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/reglamento", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Error");
      }
      setEditing(false);
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

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-6 py-10 max-w-lg mx-auto w-full">
      <Reveal>
        <h1 className="font-display text-parchment text-3xl text-center">
          Reglamento
        </h1>
        {data?.councilName ? (
          <p className="font-subtitle text-parchment/40 text-center text-sm mt-2">
            {data.councilName}
          </p>
        ) : null}
      </Reveal>

      <Reveal delay={0.15} className="mt-10 flex-1 pb-8">
        {editing ? (
          <div className="flex flex-col gap-4">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={22}
              className="rounded-sm border border-parchment/20 bg-forest/60 px-3 py-3 text-parchment outline-none focus:border-gold/50 font-body text-sm resize-y min-h-[20rem]"
            />
            <Button className="w-full" disabled={pending} onClick={() => void save()}>
              {pending ? "Guardando…" : "Guardar"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              disabled={pending}
              onClick={() => {
                setEditing(false);
                setDraft(data?.body ?? "");
              }}
            >
              Cancelar
            </Button>
            <button
              type="button"
              disabled={pending}
              onClick={() => void resetDefault()}
              className="font-subtitle text-parchment/35 text-sm min-h-11 hover:text-parchment/60"
            >
              Restaurar semilla
            </button>
          </div>
        ) : data ? (
          <>
            <ReglamentoBody text={data.body} />
            {data.canEdit ? (
              <Button
                variant="ghost"
                className="w-full mt-10"
                onClick={() => setEditing(true)}
              >
                Editar
              </Button>
            ) : null}
          </>
        ) : null}

        {error ? (
          <p className="font-body text-sm text-gold mt-4 text-center" role="alert">
            {error}
          </p>
        ) : null}
      </Reveal>

      <Link
        href="/"
        className="font-subtitle text-parchment/45 text-center text-base min-h-11 inline-flex items-center justify-center hover:text-parchment/75 pb-8"
      >
        ← Volver
      </Link>
    </div>
  );
}

export default function ReglamentoPage() {
  return (
    <MemberGate domain="reglamento">
      <ReglamentoScreen />
    </MemberGate>
  );
}
