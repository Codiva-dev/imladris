import { NextResponse } from "next/server";
import type { AvailabilityStatus } from "@prisma/client";
import { refreshMeetingProposals } from "@/domains/coordination/proposals";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";

type Body = {
  responses: { slotId: string; status: AvailabilityStatus }[];
};

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: meetingId } = await context.params;
  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  const meeting = await prisma.meeting.findFirst({
    where: { id: meetingId, councilId: membership.councilId },
    include: { slots: true },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Reunión no encontrada" }, { status: 404 });
  }

  if (
    meeting.phase !== "DISPONIBILIDAD" &&
    meeting.phase !== "QUORUM_ALCANZADO"
  ) {
    return NextResponse.json(
      { error: "La disponibilidad ya no se puede editar" },
      { status: 409 },
    );
  }

  const body = (await request.json()) as Body;
  const allowed = new Set(meeting.slots.map((s) => s.id));
  const responses = (body.responses ?? []).filter((r) => allowed.has(r.slotId));

  if (responses.length === 0) {
    return NextResponse.json({ error: "Sin respuestas" }, { status: 400 });
  }

  await prisma.$transaction(
    responses.map((r) =>
      prisma.availability.upsert({
        where: {
          slotId_userId: { slotId: r.slotId, userId: user.id },
        },
        create: {
          meetingId,
          slotId: r.slotId,
          userId: user.id,
          status: r.status,
        },
        update: { status: r.status },
      }),
    ),
  );

  const ranked = await refreshMeetingProposals(meetingId);

  return NextResponse.json({
    ok: true,
    proposalCount: ranked.length,
  });
}
