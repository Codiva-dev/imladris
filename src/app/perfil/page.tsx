"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MemberGate } from "@/components/auth/member-gate";
import { Reveal } from "@/components/council/phase-transition";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { normalizeUsername } from "@/lib/username";

type Profile = {
  id: string;
  name: string;
  username: string | null;
  handle: string | null;
  email: string;
  createdAt: string;
  role: "ORGANIZADOR" | "MIEMBRO" | null;
  councilName: string | null;
  topicsProposed: number;
};

function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = (await res.json()) as Profile & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error");
      setProfile(data);
      setName(data.name);
      setUsername(data.username ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const nextName = name.trim();
      if (nextName !== profile?.name) {
        const { error: updateError } = await authClient.updateUser({
          name: nextName,
        });
        if (updateError) {
          // continúa con API de perfil
        }
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nextName,
          username: normalizeUsername(username),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar");
      setSaved(true);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setPending(false);
    }
  }

  if (loading && !profile) {
    return <div className="min-h-dvh" aria-busy="true" aria-label="Cargando" />;
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col px-6 py-10 max-w-lg mx-auto w-full">
      <Reveal>
        <h1 className="font-display text-parchment text-3xl text-center">
          Perfil
        </h1>
      </Reveal>

      {profile ? (
        <Reveal delay={0.12} className="mt-10 flex flex-col gap-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field
              label="Nombre"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <Field
              label="Handle"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/^@+/, ""))}
              autoComplete="username"
            />
            <p className="font-body text-parchment/40 text-xs text-left -mt-2">
              Público como @{normalizeUsername(username) || "…"}
            </p>
            <Field
              label="Correo"
              type="email"
              value={profile.email}
              readOnly
            />
            <p className="font-body text-parchment/40 text-sm text-left">
              {profile.role === "ORGANIZADOR" ? "Organizador" : "Miembro"}
              {profile.councilName ? ` · ${profile.councilName}` : ""}
              {profile.topicsProposed > 0
                ? ` · ${profile.topicsProposed} tema${profile.topicsProposed === 1 ? "" : "s"} en el banco`
                : ""}
            </p>

            {error ? (
              <p className="font-body text-sm text-gold" role="alert">
                {error}
              </p>
            ) : null}
            {saved ? (
              <p className="font-subtitle text-gold text-sm" role="status">
                Guardado
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Guardando…" : "Guardar perfil"}
            </Button>
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

export default function PerfilPage() {
  return (
    <MemberGate domain="perfil">
      <ProfileScreen />
    </MemberGate>
  );
}
