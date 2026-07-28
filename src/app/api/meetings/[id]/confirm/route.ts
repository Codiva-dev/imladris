import { NextResponse } from "next/server";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: meetingId } = await context.params;
  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  const body = (await request.json()) as { proposalId?: string };
  if (!body.proposalId) {
    return NextResponse.json({ error: "proposalId requerido" }, { status: 400 });
  }

  const proposal = await prisma.dateProposal.findFirst({
    where: { id: body.proposalId, meetingId },
    include: { slot: true, meeting: true },
  });

  if (!proposal || proposal.meeting.councilId !== membership.councilId) {
    return NextResponse.json(
      { error: "Propuesta no encontrada" },
      { status: 404 },
    );
  }

  await prisma.$transaction([
    prisma.dateProposal.updateMany({
      where: { meetingId },
      data: { confirmed: false },
    }),
    prisma.dateProposal.update({
      where: { id: proposal.id },
      data: { confirmed: true },
    }),
    prisma.meeting.update({
      where: { id: meetingId },
      data: {
        startsAt: proposal.slot.startsAt,
        endsAt: proposal.slot.endsAt,
        confirmedAt: new Date(),
        phase: "FECHA_CONFIRMADA",
      },
    }),
    prisma.council.update({
      where: { id: membership.councilId },
      data: { phase: "FECHA_CONFIRMADA" },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    startsAt: proposal.slot.startsAt,
    endsAt: proposal.slot.endsAt,
  });
}
