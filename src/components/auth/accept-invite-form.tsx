"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { reportClientError } from "@/lib/client-log";
import { normalizeUsername, validateUsername } from "@/lib/username";

type Props = {
  email: string;
};

export function AcceptInviteForm({ email }: Props) {
  const { error: toastError } = useToast();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function showError(
    message: string,
    fields?: Record<string, unknown>,
  ) {
    setError(message);
    toastError(message);
    reportClientError({
      scope: "invite.form",
      message,
      fields: {
        ...fields,
        email,
        username: normalizeUsername(username) || undefined,
      },
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const handle = normalizeUsername(username);
    const usernameError = validateUsername(handle);
    if (usernameError) {
      showError(usernameError, { code: "USERNAME_INVALID" });
      return;
    }

    if (password.length < 8) {
      showError("La contraseña debe tener al menos 8 caracteres.", {
        code: "PASSWORD_SHORT",
      });
      return;
    }

    setPending(true);

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name: name.trim(),
      username: handle,
    } as {
      email: string;
      password: string;
      name: string;
      username: string;
    });

    if (signUpError) {
      showError(signUpError.message ?? "No se pudo aceptar la invitación.", {
        code: "SIGNUP_FAILED",
        authMessage: signUpError.message,
      });
      setPending(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
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
        title="3–24 caracteres: empieza con letra; luego letras, números o _"
      />
      <p className="font-body text-parchment/40 text-xs text-left -mt-2">
        Se mostrará como @{normalizeUsername(username) || "…"}. Solo letras,
        números y _; empieza con letra.
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
