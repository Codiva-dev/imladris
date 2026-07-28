import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { appOrigin } from "@/lib/council-access";
import {
  createInvitation,
  getCouncilByJoinToken,
} from "@/lib/invitations";

/** Registro vía enlace compartible del Consejo. */
export async function POST(request: Request) {
  const body = (await request.json()) as {
    token?: string;
    name?: string;
    email?: string;
    password?: string;
  };

  const token = body.token?.trim();
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!token || !name || !email || !password || password.length < 8) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const council = await getCouncilByJoinToken(token);
  if (!council) {
    return NextResponse.json({ error: "Enlace no válido" }, { status: 404 });
  }

  const organizerId = council.members[0]?.userId;
  if (!organizerId) {
    return NextResponse.json(
      { error: "El Consejo no tiene organizador" },
      { status: 400 },
    );
  }

  try {
    await createInvitation({
      councilId: council.id,
      email,
      role: "MIEMBRO",
      invitedById: organizerId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo preparar la unión";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo crear la cuenta";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    redirectTo: appOrigin(),
  });
}
