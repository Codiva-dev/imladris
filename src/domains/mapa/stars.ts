import { prisma } from "@/lib/prisma";

function hashSeed(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Posición 0–100 en el cielo 2D (+ z -1..1 para 3D), estable por seed. */
export function starPosition(seed: string): {
  x: number;
  y: number;
  z: number;
} {
  const h = hashSeed(seed);
  const x = 10 + (h % 800) / 10;
  const y = 12 + ((h >> 9) % 760) / 10;
  const z = ((h >> 18) % 200) / 100 - 1;
  return { x, y, z };
}

export async function ensureTopicStar(
  councilId: string,
  topic: { id: string; title: string; category: string },
) {
  const existing = await prisma.knowledgeNode.findUnique({
    where: { topicId: topic.id },
  });
  if (existing) {
    await prisma.knowledgeNode.update({
      where: { id: existing.id },
      data: { meetingCount: { increment: 1 }, label: topic.title },
    });
    return existing.id;
  }

  const pos = starPosition(`topic:${topic.id}`);
  const node = await prisma.knowledgeNode.create({
    data: {
      councilId,
      topicId: topic.id,
      label: topic.title,
      category: topic.category,
      positionX: pos.x,
      positionY: pos.y,
      positionZ: pos.z,
      meetingCount: 1,
    },
  });
  return node.id;
}

export async function ensureReflectionStar(
  councilId: string,
  reflection: {
    id: string;
    body: string;
    visibility: "COMPARTIDA" | "ANONIMA" | "PRIVADA";
  },
  topicId: string | null,
) {
  if (reflection.visibility === "PRIVADA") return null;

  const existing = await prisma.knowledgeNode.findUnique({
    where: { reflectionId: reflection.id },
  });
  if (existing) return existing.id;

  const label =
    reflection.body.length > 48
      ? `${reflection.body.slice(0, 45).trim()}…`
      : reflection.body;
  const pos = starPosition(`reflection:${reflection.id}`);

  const node = await prisma.knowledgeNode.create({
    data: {
      councilId,
      reflectionId: reflection.id,
      label,
      category: reflection.visibility === "ANONIMA" ? "Anónima" : "Compartida",
      positionX: pos.x,
      positionY: pos.y,
      positionZ: pos.z,
      reflectionCount: 1,
    },
  });

  if (topicId) {
    const topicNode = await prisma.knowledgeNode.findUnique({
      where: { topicId },
    });
    if (topicNode) {
      await prisma.knowledgeEdge.upsert({
        where: {
          fromId_toId: { fromId: topicNode.id, toId: node.id },
        },
        create: {
          councilId,
          fromId: topicNode.id,
          toId: node.id,
          label: "eco",
          weight: 1,
        },
        update: { weight: { increment: 0.2 } },
      });
    }
  }

  return node.id;
}

export async function getMapSnapshot(councilId: string) {
  const [nodes, edges] = await Promise.all([
    prisma.knowledgeNode.findMany({
      where: { councilId },
      select: {
        id: true,
        label: true,
        category: true,
        positionX: true,
        positionY: true,
        positionZ: true,
        meetingCount: true,
        reflectionCount: true,
        topicId: true,
        reflectionId: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.knowledgeEdge.findMany({
      where: { councilId },
      select: {
        id: true,
        fromId: true,
        toId: true,
        label: true,
        weight: true,
      },
    }),
  ]);

  return { nodes, edges };
}
