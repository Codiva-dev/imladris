"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { normalizeUsername } from "@/lib/username";

type Props = {
  email: string;
};

export function AcceptInviteForm({ email }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error: signUpError } = await authClient.signUp.email({
      email,
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
      setError(signUpError.message ?? "No se pudo aceptar la invitación.");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Correo" type="email" value={email} readOnly />
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
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
