import { NextResponse } from "next/server";
import { addHours } from "date-fns";
import {
  appOrigin,
  getActiveMeeting,
  getMembershipForUser,
  quorumPercent,
  requireSessionUser,
} from "@/lib/council-access";
import { sendConvocationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

type SlotBody = { startsAt: string };

/** Crea reunión + franjas y envía convocatoria. */
export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  const existing = await getActiveMeeting(membership.councilId);
  if (existing) {
    return NextResponse.json(
      { error: "Ya hay una convocatoria en curso" },
      { status: 409 },
    );
  }

  const body = (await request.json()) as {
    location?: string;
    slots?: SlotBody[];
  };

  const slots = (body.slots ?? [])
    .map((s) => new Date(s.startsAt))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (slots.length < 1) {
    return NextResponse.json(
      { error: "Añade al menos una franja" },
      { status: 400 },
    );
  }

  const meeting = await prisma.meeting.create({
    data: {
      councilId: membership.councilId,
      phase: "DISPONIBILIDAD",
      location: body.location?.trim() || null,
      slots: {
        create: slots.map((startsAt) => ({
          startsAt,
          endsAt: addHours(startsAt, 2),
        })),
      },
    },
    include: { slots: true },
  });

  await prisma.council.update({
    where: { id: membership.councilId },
    data: { phase: "DISPONIBILIDAD" },
  });

  const members = await prisma.councilMember.findMany({
    where: { councilId: membership.councilId },
    include: { user: { select: { email: true } } },
  });

  const actionUrl = `${appOrigin()}/`;
  const quorum = quorumPercent(membership.council.quorumThreshold);

  await Promise.allSettled(
    members.map((m) =>
      sendConvocationEmail({
        to: m.user.email,
        councilName: membership.council.name,
        quorum,
        actionUrl,
      }),
    ),
  );

  return NextResponse.json({
    id: meeting.id,
    phase: "DISPONIBILIDAD",
    slots: meeting.slots,
  });
}

/** Cancelar / volver a cerrado si organizador (solo sin confirmar). */
export async function DELETE() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  const meeting = await getActiveMeeting(membership.councilId);
  if (!meeting) {
    return NextResponse.json({ ok: true });
  }

  if (meeting.confirmedAt) {
    return NextResponse.json(
      { error: "La fecha ya está confirmada" },
      { status: 409 },
    );
  }

  await prisma.meeting.delete({ where: { id: meeting.id } });
  await prisma.council.update({
    where: { id: membership.councilId },
    data: { phase: "CERRADO" },
  });

  return NextResponse.json({ ok: true });
}
