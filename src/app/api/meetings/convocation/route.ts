import { NextResponse } from "next/server";
import {
  getActiveMeeting,
  getMembershipForUser,
  rejectIfSealed,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";

/** Abre la fase CONVOCATORIA (borrador del organizador, sin reunión aún). */
export async function POST() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  const sealed = await rejectIfSealed(membership.councilId);
  if (sealed) return sealed;

  const existing = await getActiveMeeting(membership.councilId);
  if (existing) {
    return NextResponse.json(
      { error: "Ya hay una convocatoria en curso" },
      { status: 409 },
    );
  }

  const council = await prisma.council.findUniqueOrThrow({
    where: { id: membership.councilId },
    select: { phase: true },
  });

  if (council.phase !== "CERRADO" && council.phase !== "CONVOCATORIA") {
    return NextResponse.json(
      { error: "El Consejo no está cerrado" },
      { status: 409 },
    );
  }

  await prisma.council.update({
    where: { id: membership.councilId },
    data: { phase: "CONVOCATORIA" },
  });

  return NextResponse.json({ ok: true, phase: "CONVOCATORIA" });
}

/** Cancela el borrador de convocatoria y vuelve a CERRADO. */
export async function DELETE() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json({ error: "Solo el organizador" }, { status: 403 });
  }

  const sealed = await rejectIfSealed(membership.councilId);
  if (sealed) return sealed;

  const existing = await getActiveMeeting(membership.councilId);
  if (existing) {
    return NextResponse.json(
      { error: "Hay una reunión activa; cancélala primero" },
      { status: 409 },
    );
  }

  await prisma.council.update({
    where: { id: membership.councilId },
    data: { phase: "CERRADO" },
  });

  return NextResponse.json({ ok: true, phase: "CERRADO" });
}
