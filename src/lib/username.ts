/** Identificador único del Consejo - sin @; se muestra como @nombre. */

const USERNAME_RE = /^[A-Za-z][A-Za-z0-9_]{2,23}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, "");
}

export function validateUsername(raw: string): string | null {
  const username = normalizeUsername(raw);
  if (!USERNAME_RE.test(username)) {
    return "Usa 3–24 caracteres: letra inicial, luego letras, números o _";
  }
  return null;
}

export function formatHandle(username: string | null | undefined): string | null {
  if (!username) return null;
  return `@${normalizeUsername(username)}`;
}

/** Etiqueta pública: @identificador si existe, si no el nombre. */
export function publicLabel(user: {
  name: string;
  username?: string | null;
}): string {
  return formatHandle(user.username) ?? user.name;
}
