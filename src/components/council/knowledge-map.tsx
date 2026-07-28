"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Reveal } from "@/components/council/phase-transition";
import {
  MapGraphView,
  type MapEdge,
  type MapNode,
} from "@/components/council/map-graph-view";
import { cn } from "@/lib/utils";

const MapSkyView = dynamic(
  () =>
    import("@/components/council/map-sky-view").then((m) => m.MapSkyView),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[4/5] sm:aspect-[16/11] rounded-sm border border-parchment/10 bg-[#0b1210] flex items-center justify-center">
        <p className="font-subtitle text-parchment/35 text-sm">
          Abriendo el cielo…
        </p>
      </div>
    ),
  },
);

type Mode = "plano" | "grafo" | "cielo";

export function KnowledgeMap() {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [edges, setEdges] = useState<MapEdge[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("plano");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mapa");
      const json = (await res.json()) as {
        nodes?: MapNode[];
        edges?: MapEdge[];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Error");
      setNodes(json.nodes ?? []);
      setEdges(json.edges ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedNode = nodes.find((n) => n.id === selected) ?? null;

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-4 py-10 max-w-3xl mx-auto w-full">
      <Reveal>
        <h1 className="font-display text-parchment text-3xl text-center">
          Mapa
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="font-subtitle text-parchment/40 text-center text-sm mt-2 tracking-[0.12em] uppercase">
          Cielo del Consejo
        </p>
      </Reveal>

      {!loading && nodes.length > 0 ? (
        <Reveal delay={0.14} className="mt-6 flex gap-2 justify-center flex-wrap">
          {(
            [
              ["plano", "Plano"],
              ["grafo", "Grafo"],
              ["cielo", "Cielo"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                "min-h-11 px-4 rounded-sm border font-subtitle text-sm transition-colors",
                mode === id
                  ? "border-gold/55 text-gold bg-gold/[0.07]"
                  : "border-parchment/15 text-parchment/65",
              )}
            >
              {label}
            </button>
          ))}
        </Reveal>
      ) : null}

      {loading ? (
        <p className="font-subtitle text-parchment/35 text-center mt-20">
          Desplegando estrellas…
        </p>
      ) : error ? (
        <p className="font-body text-gold text-center mt-20" role="alert">
          {error}
        </p>
      ) : nodes.length === 0 ? (
        <Reveal delay={0.2}>
          <p className="font-subtitle text-parchment/50 text-center text-lg mt-20">
            Sin estrellas aún
          </p>
        </Reveal>
      ) : (
        <Reveal delay={0.18} className="mt-6 flex-1">
          {mode === "plano" ? (
            <PlanoView
              nodes={nodes}
              edges={edges}
              selected={selected}
              onSelect={setSelected}
            />
          ) : null}
          {mode === "grafo" ? (
            <MapGraphView
              nodes={nodes}
              edges={edges}
              selected={selected}
              onSelect={setSelected}
            />
          ) : null}
          {mode === "cielo" ? (
            <MapSkyView
              nodes={nodes}
              edges={edges}
              selected={selected}
              onSelect={setSelected}
            />
          ) : null}

          <div
            className={cn(
              "mt-6 min-h-[5.5rem] text-center transition-opacity",
              selectedNode ? "opacity-100" : "opacity-40",
            )}
          >
            {selectedNode ? (
              <>
                <p className="font-subtitle text-parchment text-lg">
                  {selectedNode.label}
                </p>
                {selectedNode.category ? (
                  <p className="font-body text-parchment/45 text-sm mt-1">
                    {selectedNode.category}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="font-subtitle text-parchment/50 text-sm">
                Toca una estrella
              </p>
            )}
          </div>
        </Reveal>
      )}

      <Link
        href="/?portal=1"
        className="font-subtitle text-parchment/45 text-center text-base min-h-11 inline-flex items-center justify-center hover:text-parchment/75 mt-6 pb-8"
      >
        ← Volver
      </Link>
    </div>
  );
}

function PlanoView({
  nodes,
  edges,
  selected,
  onSelect,
}: {
  nodes: MapNode[];
  edges: MapEdge[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div
      className="relative w-full aspect-[4/5] sm:aspect-[16/11] rounded-sm overflow-hidden border border-parchment/10"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #2a4538 0%, #1a2c25 45%, #121c18 100%)",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Mapa del conocimiento"
      >
        {edges.map((e) => {
          const from = nodes.find((n) => n.id === e.fromId);
          const to = nodes.find((n) => n.id === e.toId);
          if (!from || !to) return null;
          return (
            <line
              key={e.id}
              x1={from.positionX}
              y1={from.positionY}
              x2={to.positionX}
              y2={to.positionY}
              stroke="rgba(200,169,107,0.22)"
              strokeWidth={0.25 + e.weight * 0.1}
            />
          );
        })}
        {nodes.map((n) => {
          const isTopic = Boolean(n.topicId);
          const active = selected === n.id;
          const r =
            (isTopic ? 1.4 : 0.9) +
            Math.min(1.2, (n.meetingCount + n.reflectionCount) * 0.15);
          return (
            <g key={n.id}>
              <circle
                cx={n.positionX}
                cy={n.positionY}
                r={r + 0.6}
                fill="rgba(200,169,107,0.12)"
                className="pointer-events-none"
              />
              <circle
                cx={n.positionX}
                cy={n.positionY}
                r={r}
                fill={active ? "#C8A96B" : isTopic ? "#EFE6D3" : "#4F7A63"}
                stroke={active ? "#C8A96B" : "transparent"}
                strokeWidth={0.35}
                className="cursor-pointer"
                onClick={() => onSelect(active ? null : n.id)}
              >
                <title>{n.label}</title>
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
