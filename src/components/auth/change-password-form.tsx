"use client";

import { useState } from "react";
import { PasswordCriteria } from "@/components/auth/password-criteria";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { useToast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { reportClientError } from "@/lib/client-log";
import {
  isPasswordValid,
  MIN_PASSWORD_LENGTH,
  passwordValidationMessage,
} from "@/lib/password";

function friendlyPasswordError(message: string | undefined): string {
  if (!message) return "No se pudo cambiar la contraseña.";
  const lower = message.toLowerCase();
  if (
    lower.includes("invalid") ||
    lower.includes("incorrect") ||
    lower.includes("wrong") ||
    lower.includes("current")
  ) {
    return "La contraseña actual no es correcta.";
  }
  if (lower.includes("short") || lower.includes("length") || lower.includes("criterios") || lower.includes("debe incluir")) {
    return (
      message ||
      `La nueva contraseña no cumple los criterios de seguridad.`
    );
  }
  return message;
}

export function ChangePasswordForm() {
  const { error: toastError, info: toastInfo } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function showError(message: string, fields?: Record<string, unknown>) {
    setError(message);
    toastError(message);
    reportClientError({
      scope: "profile.password",
      message,
      fields,
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isPasswordValid(newPassword)) {
      showError(
        passwordValidationMessage(newPassword) ??
          "La nueva contraseña no cumple los criterios.",
        { code: "PASSWORD_INVALID" },
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Las contraseñas nuevas no coinciden.", {
        code: "PASSWORD_MISMATCH",
      });
      return;
    }

    if (currentPassword === newPassword) {
      showError("La nueva contraseña debe ser distinta a la actual.", {
        code: "PASSWORD_UNCHANGED",
      });
      return;
    }

    setPending(true);
    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);

    if (changeError) {
      showError(friendlyPasswordError(changeError.message), {
        code: "CHANGE_FAILED",
        authMessage: changeError.message,
      });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    toastInfo("Contraseña actualizada.");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <PasswordField
        label="Contraseña actual"
        required
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        autoComplete="current-password"
      />
      <PasswordField
        label="Nueva contraseña"
        required
        minLength={MIN_PASSWORD_LENGTH}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        autoComplete="new-password"
      />
      <PasswordCriteria password={newPassword} />
      <PasswordField
        label="Confirmar nueva contraseña"
        required
        minLength={MIN_PASSWORD_LENGTH}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
      />

      {error ? (
        <p className="font-body text-sm text-gold" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Cambiando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
