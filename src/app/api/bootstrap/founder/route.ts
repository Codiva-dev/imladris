import { NextResponse } from "next/server";
import { sendFounderInviteEmail } from "@/lib/email";

/**
 * Dispara el correo de fundador (una sola vez / bootstrap).
 * Auth: Authorization: Bearer <BETTER_AUTH_SECRET>
 */
export async function POST(request: Request) {
  const expected = process.env.BETTER_AUTH_SECRET;
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
  };

  const email = (body.email ?? "").trim().toLowerCase();
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
