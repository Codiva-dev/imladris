/** Criterios mínimos de seguridad para altas y cambio de contraseña. */

export const MIN_PASSWORD_LENGTH = 8;

export type PasswordRuleId =
  | "minLength"
  | "lowercase"
  | "uppercase"
  | "number"
  | "symbol";

export type PasswordRule = {
  id: PasswordRuleId;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "minLength",
    label: `Al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    test: (password) => password.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: "lowercase",
    label: "Una letra minúscula",
    test: (password) => /[a-záéíóúüñ]/.test(password),
  },
  {
    id: "uppercase",
    label: "Una letra mayúscula",
    test: (password) => /[A-ZÁÉÍÓÚÜÑ]/.test(password),
  },
  {
    id: "number",
    label: "Un número",
    test: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    label: "Un símbolo (!@#…)",
    test: (password) => /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]/.test(password),
  },
] as const;

export type PasswordRuleStatus = {
  id: PasswordRuleId;
  label: string;
  met: boolean;
};

export function evaluatePassword(password: string): PasswordRuleStatus[] {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password),
  }));
}

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

export function passwordValidationMessage(password: string): string | null {
  const unmet = evaluatePassword(password).find((rule) => !rule.met);
  if (!unmet) return null;
  return `La contraseña debe incluir: ${unmet.label.toLowerCase()}.`;
}
