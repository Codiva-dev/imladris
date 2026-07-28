"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

type Props = {
  onSent?: (email: string) => void;
};

export function InviteForm({ onSent }: Props) {
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, role: "MIEMBRO" }),
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
