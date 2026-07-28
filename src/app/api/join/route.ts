import { NextResponse } from "next/server";
import {
  createInvitation,
  getCouncilByJoinToken,
} from "@/lib/invitations";
import { log, maskSecret } from "@/lib/log";
import { prisma } from "@/lib/prisma";

/**
 * Prepara una invitación PENDING vía enlace compartible.
 * El cliente completa el registro con signUp (cookies de sesión correctas).
 */
export async function POST(request: Request) {
  const body = (await request.json()) as {
    token?: string;
    email?: string;
  };

  const token = body.token?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!token || !email) {
    log.warn("join", "Datos incompletos", {
      hasToken: Boolean(token),
      hasEmail: Boolean(email),
    });
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const council = await getCouncilByJoinToken(token);
  if (!council) {
    log.warn("join", "Enlace no válido", {
      token: maskSecret(token),
      email,
    });
    return NextResponse.json({ error: "Enlace no válido" }, { status: 404 });
  }

  if (council.phase === "CUENTA_REGRESIVA" || council.phase === "EN_CURSO") {
    log.warn("join", "Consejo sellado", {
      councilId: council.id,
      phase: council.phase,
      email,
    });
    return NextResponse.json(
      {
        error:
          "El Consejo está reunido. La puerta permanece cerrada hasta que termine.",
        sealed: true,
      },
      { status: 423 },
    );
  }

  const organizerId = council.members[0]?.userId;
  if (!organizerId) {
    log.error("join", "Sin organizador", { councilId: council.id, email });
    return NextResponse.json(
      { error: "El Consejo no tiene organizador" },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      memberships: {
        where: { councilId: council.id },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (existingUser?.memberships.length) {
    log.info("join", "Ya es miembro", {
      councilId: council.id,
      email,
      code: "ALREADY_MEMBER",
    });
    return NextResponse.json(
      {
        error: "Ya formas parte del Consejo. Entra con tu correo y contraseña.",
        code: "ALREADY_MEMBER",
      },
      { status: 409 },
    );
  }

  if (existingUser) {
    log.info("join", "Correo ya registrado", {
      councilId: council.id,
      email,
      code: "EMAIL_TAKEN",
    });
    return NextResponse.json(
      {
        error: "Ese correo ya tiene cuenta. Entra desde el inicio.",
        code: "EMAIL_TAKEN",
      },
      { status: 409 },
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
    log.error("join", "Fallo al crear invitación", {
      councilId: council.id,
      email,
      error,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }

  log.info("join", "Invitación preparada", {
    councilId: council.id,
    email,
  });
  return NextResponse.json({ ok: true });
}
