import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/council-access";
import { log } from "@/lib/log";

const MAX_MESSAGE = 400;
const MAX_SCOPE = 80;

/** Ingesta de errores del cliente para Runtime Logs (solo sesión). */
export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
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
    userId: user.id,
    path: typeof body.path === "string" ? body.path.slice(0, 120) : undefined,
    ua: typeof body.ua === "string" ? body.ua.slice(0, 180) : undefined,
    ...(body.fields && typeof body.fields === "object" ? body.fields : {}),
  };

  if (level === "warn") log.warn(scope, message, fields);
  else log.error(scope, message, fields);

  return NextResponse.json({ ok: true });
}
