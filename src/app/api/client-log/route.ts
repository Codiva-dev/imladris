import { NextResponse } from "next/server";
import { log } from "@/lib/log";

const MAX_MESSAGE = 400;
const MAX_SCOPE = 80;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 40;

const hits = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function allow(key: string): boolean {
  const now = Date.now();
  const row = hits.get(key);
  if (!row || row.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (row.count >= RATE_MAX) return false;
  row.count += 1;
  return true;
}

/** Ingesta de errores del cliente para Runtime Logs. */
export async function POST(request: Request) {
  const key = clientKey(request);
  if (!allow(key)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: {
    scope?: string;
    message?: string;
    level?: "warn" | "error";
    fields?: Record<string, unknown>;
    path?: string;
    ua?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const scope = (body.scope ?? "client").slice(0, MAX_SCOPE);
  const message = (body.message ?? "error").slice(0, MAX_MESSAGE);
  const level = body.level === "warn" ? "warn" : "error";

  const fields = {
    source: "client",
    path: typeof body.path === "string" ? body.path.slice(0, 120) : undefined,
    ua: typeof body.ua === "string" ? body.ua.slice(0, 180) : undefined,
    ip: key === "unknown" ? undefined : key,
    ...(body.fields && typeof body.fields === "object" ? body.fields : {}),
  };

  if (level === "warn") log.warn(scope, message, fields);
  else log.error(scope, message, fields);

  return NextResponse.json({ ok: true });
}
