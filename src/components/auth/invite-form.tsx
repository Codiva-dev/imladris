"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { MemberRole } from "@prisma/client";

type Props = {
  onSent?: (email: string) => void;
  defaultRole?: MemberRole;
};

export function InviteForm({ onSent, defaultRole = "MIEMBRO" }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = (await res.json()) as { error?: string; email?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo invitar");
      }
      setEmail("");
      onSent?.(data.email ?? email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo invitar");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm flex flex-col gap-4">
      <Field
        label="Correo"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <label className="flex flex-col gap-1.5 text-left">
        <span className="font-subtitle text-parchment/70 text-sm">Rol</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as MemberRole)}
          className="min-h-11 rounded-sm border border-parchment/20 bg-forest/60 px-3 text-parchment outline-none focus:border-gold/50"
        >
          <option value="MIEMBRO">Miembro</option>
          <option value="ORGANIZADOR">Organizador</option>
        </select>
      </label>
      {error ? (
        <p className="font-body text-sm text-gold" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enviando…" : "Invitar"}
      </Button>
    </form>
  );
}
