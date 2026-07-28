import { NextResponse } from "next/server";
import { advanceOrganizer } from "@/domains/council/organizer-rotation";
import {
  getActiveMeeting,
  getMembershipForUser,
  rejectIfSealed,
  requireSessionUser,
} from "@/lib/council-access";
import { publicLabel } from "@/lib/username";

/** El organizador cede el cargo al siguiente en la ronda (solo sin reunión activa). */
export async function POST() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || membership.role !== "ORGANIZADOR") {
    return NextResponse.json(
      { error: "Solo el organizador puede ceder el cargo." },
      { status: 403 },
    );
  }

  const sealed = await rejectIfSealed(membership.councilId);
  if (sealed) return sealed;

  const active = await getActiveMeeting(membership.councilId);
  if (active) {
    return NextResponse.json(
      {
        error:
          "Hay una convocatoria en curso. Cede la organización cuando el Consejo esté cerrado.",
      },
      { status: 409 },
    );
  }

  const next = await advanceOrganizer(membership.councilId);
  if (!next) {
    return NextResponse.json(
      { error: "No se pudo avanzar la organización." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    organizer: {
      id: next.id,
      label: publicLabel(next),
    },
  });
}
