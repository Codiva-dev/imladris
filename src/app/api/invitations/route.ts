import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/email";
import { rejectIfSealed } from "@/lib/council-access";
import { createInvitation, inviteUrl } from "@/lib/invitations";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    email?: string;
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
    include: {
      council: { select: { name: true } },
    },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "Solo el organizador puede invitar." },
      { status: 403 },
    );
  }

  const sealed = await rejectIfSealed(membership.councilId);
  if (sealed) return sealed;

  try {
    const invitation = await createInvitation({
      councilId: membership.councilId,
      email: body.email,
      role: "MIEMBRO",
      invitedById: session.user.id,
    });

    const origin =
      process.env.BETTER_AUTH_URL ?? new URL(request.url).origin;
    const url = inviteUrl(origin.replace(/\/$/, ""), invitation.token);

    await sendInvitationEmail({
      to: invitation.email,
      inviterName: session.user.name,
      councilName: membership.council.name,
      inviteUrl: url,
      role: invitation.role,
    });

    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo crear la invitación";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
