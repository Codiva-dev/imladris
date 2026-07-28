"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error: signInError } = await authClient.signIn.email({
      email: email.trim().toLowerCase(),
      password,
    });

    setPending(false);

    if (signInError) {
      setError(signInError.message ?? "No se pudo entrar.");
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
        label="Correo"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Field
        label="Contraseña"
        type="password"
        required
        minLength={8}
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error ? (
        <p className="font-body text-sm text-gold" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full mt-2 shadow-[0_0_32px_rgba(200,169,107,0.22)]"
        disabled={pending}
      >
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
