import { NextResponse } from "next/server";
import {
  getMembershipForUser,
  rejectIfSealed,
  requireSessionUser,
} from "@/lib/council-access";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  const approaches = await prisma.approach.findMany({
    where: { councilId: membership.councilId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return NextResponse.json({ approaches });
}

export async function POST(request: Request) {
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

  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim() ?? "";
  if (name.length < 2) {
    return NextResponse.json({ error: "Nombre demasiado corto" }, { status: 400 });
  }

  try {
    const approach = await prisma.approach.create({
      data: { councilId: membership.councilId, name },
      select: { id: true, name: true },
    });
    return NextResponse.json({ approach }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ese enfoque ya existe" },
      { status: 409 },
    );
  }
}

export async function DELETE(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const approach = await prisma.approach.findFirst({
    where: { id, councilId: membership.councilId },
  });
  if (!approach) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.approach.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
