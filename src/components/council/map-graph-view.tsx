"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type MapNode = {
  id: string;
  label: string;
  category: string | null;
  positionX: number;
  positionY: number;
  positionZ?: number;
  meetingCount: number;
  reflectionCount: number;
  topicId: string | null;
  reflectionId: string | null;
};

export type MapEdge = {
  id: string;
  fromId: string;
  toId: string;
  label: string | null;
  weight: number;
};

type Props = {
  nodes: MapNode[];
  edges: MapEdge[];
  selected: string | null;
  onSelect: (id: string | null) => void;
};

/** Grafo 2D con layout de fuerzas suave (constelaciones). */
export function MapGraphView({ nodes, edges, selected, onSelect }: Props) {
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const frame = useRef(0);

  const initial = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    for (const n of nodes) {
      map[n.id] = { x: n.positionX, y: n.positionY };
    }
    return map;
  }, [nodes]);

  useEffect(() => {
    setPos(initial);
  }, [initial]);

  useEffect(() => {
    if (nodes.length === 0) return;
    let cancelled = false;
    let positions = { ...initial };
    let ticks = 0;

    const step = () => {
      if (cancelled) return;
      ticks += 1;
      const next: Record<string, { x: number; y: number }> = {};
      for (const n of nodes) {
        const p = positions[n.id] ?? { x: n.positionX, y: n.positionY };
        let fx = 0;
        let fy = 0;

        for (const other of nodes) {
          if (other.id === n.id) continue;
          const o = positions[other.id] ?? {
            x: other.positionX,
            y: other.positionY,
          };
          const dx = p.x - o.x;
          const dy = p.y - o.y;
          const dist2 = Math.max(4, dx * dx + dy * dy);
          fx += (dx / dist2) * 28;
          fy += (dy / dist2) * 28;
        }

        for (const e of edges) {
          let otherId: string | null = null;
          if (e.fromId === n.id) otherId = e.toId;
          if (e.toId === n.id) otherId = e.fromId;
          if (!otherId) continue;
          const o = positions[otherId];
          if (!o) continue;
          fx += (o.x - p.x) * 0.015 * e.weight;
          fy += (o.y - p.y) * 0.015 * e.weight;
        }

        fx += (50 - p.x) * 0.002;
        fy += (50 - p.y) * 0.002;

        next[n.id] = {
          x: Math.min(92, Math.max(8, p.x + fx * 0.35)),
          y: Math.min(92, Math.max(8, p.y + fy * 0.35)),
        };
      }
      positions = next;
      setPos(next);
      if (ticks < 160) {
        frame.current = window.requestAnimationFrame(step);
      }
    };

    frame.current = window.requestAnimationFrame(step);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame.current);
    };
  }, [nodes, edges, initial]);

  return (
    <div
      className="relative w-full aspect-[4/5] sm:aspect-[16/11] rounded-sm overflow-hidden border border-parchment/10"
      style={{
        background:
          "radial-gradient(ellipse at 40% 35%, #2f4a3c 0%, #1a2c25 50%, #0f1714 100%)",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Grafo del conocimiento"
      >
        {edges.map((e) => {
          const from = pos[e.fromId];
          const to = pos[e.toId];
          if (!from || !to) return null;
          return (
            <line
              key={e.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(200,169,107,0.28)"
              strokeWidth={0.3 + e.weight * 0.12}
            />
          );
        })}
        {nodes.map((n) => {
          const p = pos[n.id];
          if (!p) return null;
          const isTopic = Boolean(n.topicId);
          const active = selected === n.id;
          const r =
            (isTopic ? 1.5 : 1) +
            Math.min(1.2, (n.meetingCount + n.reflectionCount) * 0.15);
          return (
            <circle
              key={n.id}
              cx={p.x}
              cy={p.y}
              r={r}
              fill={active ? "#C8A96B" : isTopic ? "#EFE6D3" : "#4F7A63"}
              className={cn("cursor-pointer")}
              onClick={() => onSelect(active ? null : n.id)}
            >
              <title>{n.label}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}
