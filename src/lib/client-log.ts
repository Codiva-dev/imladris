"use client";

type ClientLogPayload = {
  scope: string;
  message: string;
  level?: "warn" | "error";
  fields?: Record<string, unknown>;
};

/**
 * Reporta fallos del cliente a /api/client-log (fire-and-forget).
 * Nunca envía password ni tokens completos.
 */
export function reportClientError(payload: ClientLogPayload) {
  const body = {
    scope: payload.scope,
    message: payload.message,
    level: payload.level ?? "error",
    fields: payload.fields ?? {},
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
    ua:
      typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 180)
        : undefined,
  };

  try {
    const json = JSON.stringify(body);
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([json], { type: "application/json" });
      navigator.sendBeacon("/api/client-log", blob);
      return;
    }
    void fetch("/api/client-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: true,
    });
  } catch {
    // Nunca bloquear la UI por telemetría
  }
}
