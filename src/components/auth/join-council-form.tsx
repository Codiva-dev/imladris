"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { normalizeUsername } from "@/lib/username";

type Props = {
  token: string;
};

export function JoinCouncilForm({ token }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name,
          username: normalizeUsername(username),
          email,
          password,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "No se pudo unir");

      const { authClient } = await import("@/lib/auth-client");
      const { error: signInError } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) {
        router.replace("/");
        return;
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field
        label="Nombre"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
      />
      <Field
        label="Identificador"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value.replace(/^@+/, ""))}
        autoComplete="username"
        placeholder="tu_nombre"
      />
      <p className="font-body text-parchment/40 text-xs text-left -mt-2">
        Se mostrará como @{normalizeUsername(username) || "…"}
      </p>
      <Field
        label="Correo"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Field
        label="Contraseña"
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      {error ? (
        <p className="font-body text-sm text-gold" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full mt-2" disabled={pending}>
        {pending ? "Entrando…" : "Unirme al Consejo"}
      </Button>
    </form>
  );
}
