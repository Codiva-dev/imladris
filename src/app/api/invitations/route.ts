import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createInvitation, inviteUrl } from "@/lib/invitations";
import { prisma } from "@/lib/prisma";
import type { MemberRole } from "@prisma/client";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    email?: string;
    role?: MemberRole;
    councilId?: string;
  };

  if (!body.email?.trim()) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const membership = await prisma.councilMember.findFirst({
    where: {
      userId: session.user.id,
      role: "ORGANIZADOR",
      ...(body.councilId ? { councilId: body.councilId } : {}),
    },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Solo el organizador puede invitar." },
      { status: 403 },
    );
  }

  try {
    const invitation = await createInvitation({
      councilId: membership.councilId,
      email: body.email,
      role: body.role,
      invitedById: session.user.id,
    });

    const origin = new URL(request.url).origin;
    const url = inviteUrl(origin, invitation.token);

    // Email (Resend) llega después; por ahora devolvemos el enlace.
    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo crear la invitación";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
