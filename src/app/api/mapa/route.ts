import { NextResponse } from "next/server";
import { getMapSnapshot } from "@/domains/mapa";
import { advanceCouncilLifecycle } from "@/domains/reunion";
import {
  getMembershipForUser,
  requireSessionUser,
} from "@/lib/council-access";

export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Sin Consejo" }, { status: 404 });
  }

  await advanceCouncilLifecycle(membership.councilId);
  const snapshot = await getMapSnapshot(membership.councilId);

  return NextResponse.json(snapshot);
}
