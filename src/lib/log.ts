type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

const SENSITIVE_KEYS = new Set([
  "password",
  "newPassword",
  "oldPassword",
  "token",
  "joinToken",
  "authorization",
  "cookie",
  "secret",
]);

function maskToken(value: string): string {
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function sanitize(value: unknown, key?: string): unknown {
  if (key && SENSITIVE_KEYS.has(key.toLowerCase())) {
    if (typeof value === "string") return maskToken(value);
    return "[redacted]";
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(process.env.NODE_ENV !== "production"
        ? { stack: value.stack }
        : {}),
    };
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitize(v, k);
    }
    return out;
  }
  return value;
}

function write(level: LogLevel, scope: string, message: string, fields?: LogFields) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...(fields ? (sanitize(fields) as LogFields) : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

/** Logger estructurado → Runtime Logs de Vercel (JSON). */
export const log = {
  info(scope: string, message: string, fields?: LogFields) {
    write("info", scope, message, fields);
  },
  warn(scope: string, message: string, fields?: LogFields) {
    write("warn", scope, message, fields);
  },
  error(scope: string, message: string, fields?: LogFields) {
    write("error", scope, message, fields);
  },
};

export function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  return maskToken(value);
}
