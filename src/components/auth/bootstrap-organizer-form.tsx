"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { normalizeUsername } from "@/lib/username";

type Props = {
  initialEmail?: string;
};

export function BootstrapOrganizerForm({ initialEmail = "" }: Props) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("Bohemianmage");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error: signUpError } = await authClient.signUp.email({
      email: email.trim().toLowerCase(),
      password,
      name: name.trim(),
      username: normalizeUsername(username),
    } as {
      email: string;
      password: string;
      name: string;
      username: string;
    });

    setPending(false);

    if (signUpError) {
      setError(signUpError.message ?? "No se pudo abrir el Consejo.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-10 w-full max-w-sm flex flex-col gap-4"
    >
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
        placeholder="Bohemianmage"
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
        readOnly={Boolean(initialEmail)}
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

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Abriendo…" : "Fundar el Consejo"}
      </Button>
    </form>
  );
}
