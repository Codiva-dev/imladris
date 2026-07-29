import { NextResponse } from "next/server";
import { sendFounderInviteEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

/**
 * Dispara el correo de fundador (bootstrap).
 * Deshabilitado por defecto. Activar solo con ENABLE_FOUNDER_BOOTSTRAP=true
 * y solo mientras no exista ningún usuario.
 * Preferible: `npm run email:founder -- <email>`
 *
 * Auth: Authorization: Bearer <BETTER_AUTH_SECRET>
 */
export async function POST(request: Request) {
  if (process.env.ENABLE_FOUNDER_BOOTSTRAP !== "true") {
    return NextResponse.json(
      { error: "Bootstrap deshabilitado. Usa el script local email:founder." },
      { status: 410 },
    );
  }

  const expected = process.env.BETTER_AUTH_SECRET;
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    return NextResponse.json(
      { error: "El Consejo ya fue fundado" },
      { status: 409 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
  };

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Indica un email válido en el body" },
      { status: 400 },
    );
  }

  const base = (process.env.BETTER_AUTH_URL ?? "https://imladris.online").replace(
    /\/$/,
    "",
  );
  const fundarUrl = `${base}/fundar?email=${encodeURIComponent(email)}`;

  try {
    await sendFounderInviteEmail({
      to: email,
      founderName: body.name,
      fundarUrl,
    });
    return NextResponse.json({ ok: true, email, fundarUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo enviar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
