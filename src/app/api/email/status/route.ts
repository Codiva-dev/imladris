import { NextResponse } from "next/server";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";

/** Estado del remitente de correo (Resend). */
export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? "Imladris <consejo@imladris.online>";
  const usingCustomDomain = /@imladris\.online>?$/i.test(from);
  const hasApiKey = Boolean(process.env.RESEND_API_KEY);

  let domainStatus: "unknown" | "ok" | "missing_key" = "unknown";
  if (!hasApiKey) domainStatus = "missing_key";
  else if (usingCustomDomain) domainStatus = "ok";

  return NextResponse.json({
    from,
    usingCustomDomain,
    domainStatus,
    hint: usingCustomDomain
      ? "Remitente en imladris.online - verifica el dominio en Resend si los mails no llegan."
      : "Configura RESEND_FROM_EMAIL=Imladris <consejo@imladris.online> y verifica el dominio en Resend.",
  });
}
