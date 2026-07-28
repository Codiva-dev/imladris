import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { normalizeUsername, validateUsername } from "@/lib/username";

/**
 * Acceso solo por invitación (o primer usuario bootstrap).
 * El signup público queda bloqueado salvo invitación PENDING válida.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        unique: true,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = user.email.toLowerCase();
          const existingUsers = await prisma.user.count();

          const rawUsername =
            typeof (user as Record<string, unknown>).username === "string"
              ? ((user as Record<string, unknown>).username as string)
              : "";
          const username = normalizeUsername(rawUsername);
          const usernameError = validateUsername(username);
          if (usernameError) {
            throw new APIError("BAD_REQUEST", { message: usernameError });
          }

          const taken = await prisma.user.findFirst({
            where: {
              username: { equals: username, mode: "insensitive" },
            },
            select: { id: true },
          });
          if (taken) {
            throw new APIError("BAD_REQUEST", {
              message: "Ese identificador ya está tomado.",
            });
          }

          if (existingUsers === 0) {
            return { data: { ...user, email, username } };
          }

          const invitation = await prisma.invitation.findFirst({
            where: {
              email,
              status: "PENDING",
              expiresAt: { gt: new Date() },
            },
          });

          if (!invitation) {
            throw new APIError("FORBIDDEN", {
              message: "El Consejo solo abre su puerta por invitación.",
            });
          }

          const council = await prisma.council.findUnique({
            where: { id: invitation.councilId },
            select: { phase: true },
          });
          if (
            council?.phase === "CUENTA_REGRESIVA" ||
            council?.phase === "EN_CURSO"
          ) {
            throw new APIError("FORBIDDEN", {
              message:
                "El Consejo está reunido. La puerta permanece cerrada hasta que termine.",
            });
          }

          return { data: { ...user, email, username } };
        },
        after: async (user) => {
          const email = user.email.toLowerCase();
          const invitation = await prisma.invitation.findFirst({
            where: {
              email,
              status: "PENDING",
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
          });

          if (!invitation) {
            // Primer usuario: crear Consejo y nombrarlo organizador.
            const council = await prisma.council.create({
              data: {
                name: "El Consejo de Elrond",
                members: {
                  create: {
                    userId: user.id,
                    role: "ORGANIZADOR",
                  },
                },
                rules: { create: {} },
                approaches: {
                  create: [
                    { name: "Ética" },
                    { name: "Historia" },
                    { name: "Estrategia" },
                    { name: "Experiencia personal" },
                    { name: "Ciencia" },
                  ],
                },
              },
            });
            void council;

            // Handle canónico del fundador si aún no vino en el signup
            const current = await prisma.user.findUnique({
              where: { id: user.id },
              select: { username: true },
            });
            if (!current?.username) {
              await prisma.user.update({
                where: { id: user.id },
                data: { username: "Bohemianmage" },
              });
            }
            return;
          }

          await prisma.$transaction([
            prisma.invitation.update({
              where: { id: invitation.id },
              data: {
                status: "ACCEPTED",
                acceptedAt: new Date(),
              },
            }),
            prisma.councilMember.create({
              data: {
                councilId: invitation.councilId,
                userId: user.id,
                role: invitation.role,
              },
            }),
          ]);
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
