"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

/** Primera puerta: crear el organizador cuando el Consejo aún no tiene miembros. */
export function BootstrapOrganizerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
      className="mt-10 w-full max-w-sm flex flex-col gap-4 text-left"
    >
      <p className="font-body text-parchment/55 text-sm text-center mb-1">
        Sé el primero: funda el Consejo como organizador.
      </p>

      <label className="flex flex-col gap-1.5">
        <span className="font-subtitle text-parchment/70 text-sm">Nombre</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-11 rounded-sm border border-parchment/20 bg-forest/60 px-3 text-parchment outline-none focus:border-gold/50"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-subtitle text-parchment/70 text-sm">Correo</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-11 rounded-sm border border-parchment/20 bg-forest/60 px-3 text-parchment outline-none focus:border-gold/50"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-subtitle text-parchment/70 text-sm">
          Contraseña
        </span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-11 rounded-sm border border-parchment/20 bg-forest/60 px-3 text-parchment outline-none focus:border-gold/50"
        />
      </label>

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
