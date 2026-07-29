"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Reveal } from "@/components/council/phase-transition";

type Member = {
  userId: string;
  name: string;
  username: string | null;
  handle: string | null;
  label: string;
  role: "ORGANIZADOR" | "MIEMBRO";
  joinedAt: string;
  hasOrganizedThisRound: boolean;
};

export function MembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/council/members");
      const data = (await res.json()) as {
        members?: Member[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMembers(data.members ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && members.length === 0) {
    return <div className="min-h-dvh" aria-busy="true" aria-label="Cargando" />;
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-6 py-10 max-w-lg mx-auto w-full">
      <Reveal>
        <h1 className="font-display text-parchment text-3xl text-center">
          Miembros
        </h1>
        <p className="font-subtitle text-parchment/45 text-center text-sm mt-3">
          El círculo, por su identificador
        </p>
      </Reveal>

      {error ? (
        <p className="font-body text-gold/80 text-sm text-center mt-8" role="alert">
          {error}
        </p>
      ) : null}

      <Reveal delay={0.12} className="mt-10 flex flex-col gap-3 pb-8">
        {members.map((m) => (
          <div
            key={m.userId}
            className="border border-parchment/12 rounded-sm px-4 py-4 text-left"
          >
            <p className="font-subtitle text-parchment text-xl tracking-wide">
              {m.handle ?? m.name}
            </p>
            {m.handle ? (
              <p className="font-body text-parchment/40 text-sm mt-1">{m.name}</p>
            ) : (
              <p className="font-body text-parchment/35 text-sm mt-1">
                Sin identificador aún
              </p>
            )}
            <p className="font-subtitle text-parchment/35 text-xs mt-3 tracking-[0.12em] uppercase">
              {m.role === "ORGANIZADOR" ? "Organiza ahora" : "Miembro"}
              {m.hasOrganizedThisRound && m.role !== "ORGANIZADOR"
                ? " · ya organizó esta ronda"
                : null}
            </p>
          </div>
        ))}
      </Reveal>

      <Link
        href="/?portal=1"
        className="font-subtitle text-parchment/50 text-center min-h-11 inline-flex items-center justify-center hover:text-parchment/70"
      >
        ← Volver
      </Link>
    </div>
  );
}
