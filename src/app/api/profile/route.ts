import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatHandle,
  normalizeUsername,
  validateUsername,
} from "@/lib/username";

/** Perfil del miembro: nombre, handle, correo, rol. */
export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  const row = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      createdAt: true,
      _count: { select: { topicsProposed: true } },
    },
  });

  return NextResponse.json({
    id: row.id,
    name: row.name,
    username: row.username,
    handle: formatHandle(row.username),
    email: row.email,
    createdAt: row.createdAt,
    role: membership?.role ?? null,
    councilName: membership?.council.name ?? null,
    topicsProposed: row._count.topicsProposed,
  });
}

/** Actualizar nombre y/ o handle. */
export async function PATCH(request: Request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string; username?: string };
  const data: { name?: string; username?: string } = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (name.length < 2) {
      return NextResponse.json(
        { error: "Nombre demasiado corto" },
        { status: 400 },
      );
    }
    if (name.length > 80) {
      return NextResponse.json(
        { error: "Nombre demasiado largo" },
        { status: 400 },
      );
    }
    data.name = name;
  }

  if (typeof body.username === "string") {
    const username = normalizeUsername(body.username);
    const usernameError = validateUsername(username);
    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }
    const taken = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: "insensitive" },
        NOT: { id: user.id },
      },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json(
        { error: "Ese handle ya está tomado." },
        { status: 409 },
      );
    }
    data.username = username;
  }

  if (!data.name && !data.username) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  if (data.name) {
    try {
      await auth.api.updateUser({
        body: { name: data.name },
        headers: await headers(),
      });
    } catch {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: data.name },
      });
    }
  }

  if (data.username) {
    await prisma.user.update({
      where: { id: user.id },
      data: { username: data.username },
    });
  }

  const row = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { name: true, username: true },
  });

  return NextResponse.json({
    ok: true,
    name: row.name,
    username: row.username,
    handle: formatHandle(row.username),
  });
}
